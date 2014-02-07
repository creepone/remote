var _ = require("underscore"),
    db = require("../db"),
    ObjectID = require("mongodb").ObjectID,
    crypto = require("crypto"),
    generatePassword = require("password-generator")


var User = function(o) {
    _.extend(this, o);

    if (typeof this._id === "string")
        this._id = new ObjectID(this._id);
}

_.extend(User.prototype, {
    displayName: function () {
        if (this.firstName && this.lastName)
            return this.firstName + " " + this.lastName;
        else if (this.firstName)
            return this.firstName;
        else if (this.lastName)
            return this.lastName;
        else
            return this.email;
    }
})

_.extend(exports, {
    User: User,
    routes: {
        post: function (req, res) {
            var user = _.pick(req.body, "email", "authToken", "password", "firstName", "lastName");

            if (!user.email || (!user.authToken && !user.password) || !user.firstName || !user.lastName)
                throw new Error("Missing user data");

            var registrationCode = process.env.APP_REGISTRATION_CODE || "";
            if (registrationCode) {
                if (req.body.registrationCode !== registrationCode)
                    throw new Error("Invalid registration code.");
            }

            // replace the plain text password with its hash before saving into db
            if (user.password)
                user.password = crypto.createHash('md5').update(user.password).digest("hex");

            user.slaveToken = generatePassword(20, false);

            return db.getUser({ email: user.email })
                .then(function(duplicate) {
                    if (duplicate)
                        throw new Error("Email already in use");
                })
                .then(function() {
                    return db.insertUser(user);
                })
                .then(function () {
                    res.json({});
                });
        }
    }
})

var db = require("../db"),
    crypto = require("crypto"),
    generatePassword = require("password-generator");

exports.render = function (req, res) {

    // if available, pre-fill some fields from the provider
    var provider, authToken, email, firstName, lastName;

    var registrationInfo = req.session.registrationInfo;
    if (registrationInfo) {
        if (registrationInfo.google) {
            var profile = registrationInfo.google.profile;
            provider = "google";
            authToken = registrationInfo.google.identifier;
            email = profile.emails && profile.emails[0] && profile.emails[0].value;

            if (profile.name) {
                var name = profile.name;
                firstName = name.givenName;
                lastName = name.middleName ? name.middleName + " " + (name.familyName || "") : name.familyName;
            }
        }

        delete req.session.registrationInfo;
    }

    res.render("register", {
        provider: provider,
        authToken: authToken,
        email: email || "",
        firstName: firstName || "",
        lastName : lastName || "",
        data: {}
    });
};

exports.post = function (req, res) {

    var user = req.body.user;

    if (!user.email || (!user.authToken && !user.password) || !user.firstName || !user.lastName)
        return res.json({ error: "Missing data from the form" });

    // replace the plain text password with its hash before saving into db
    if (user.password)
        user.password = crypto.createHash('md5').update(user.password).digest("hex");

    user.slaveToken = generatePassword(20, false);

    db.getUser({ email: user.email })
        .then(function(duplicate) {
            if (duplicate)
                throw new Error("Email already in use");
        })
        .then(function() {
            return db.insertUser(user);
        })
        .done(function () {
            res.json({ success: true });
        },
        function(err) {
            console.log(err);
            res.json({ error: err.message || "Registration error" });
        });
};
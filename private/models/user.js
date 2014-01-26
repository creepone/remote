var _ = require("underscore"),
    ObjectID = require("mongodb").ObjectID;


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

exports.User = User;
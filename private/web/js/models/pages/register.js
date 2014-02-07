var _ = require("../../lib/underscore"),
    Q = require("../../lib/q.min.js"),
    Backbone = require("../../lib/backbone");

var RegisterPageModel = Backbone.Model.extend({
    properties: "authToken,codeRequired,email,password,repeatPassword,firstName,lastName,registrationCode",
    url: "/users",

    validate: function(attrs, options) {
        if (!attrs.email)
            return { name: "email", message: "Email missing" };

        if (!attrs.authToken) {
            if (!attrs.password)
                return { name: "password", message: "Password missing" };
            if (!attrs.repeatPassword)
                return { name: "repeatPassword", message: "Password missing" };
            if (attrs.password !== attrs.repeatPassword)
                return { name: "password", message: "Password mismatch" };
        }

        if (!attrs.firstName)
            return { name: "firstName", message: "First name missing" };
        if (!attrs.lastName)
            return { name: "lastName", message: "Last name missing" };
        if (attrs.codeRequired && !attrs.registrationCode)
            return { name: "registrationCode", message: "Registration code missing" };
    }
});

_.extend(exports, {
    RegisterPageModel: RegisterPageModel
});
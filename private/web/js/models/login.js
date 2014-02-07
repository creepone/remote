var _ = require("../lib/underscore"),
    Q = require("../lib/q.min"),
    Backbone = require("../lib/backbone"),
    services = require("./services");

var LoginPageModel = Backbone.Model.extend({
    properties: "providers,email,password",

    login: function (passport) {
        if (passport === "auto") {
            passport = this.getPassport();
            if (!passport)
                return Q("");
        }

        if (passport) {
            var provider = this.providers[passport];
            this.storePassport(passport);
            return Q(provider.url);
        }

        return services.login({
            username: this.email,
            password: this.password
        })
        .then(function () { return "/"; });
    },

    storePassport: function (passport) {
        if (localStorage)
            localStorage.setItem("passport", passport);
    },
    getPassport: function () {
        return localStorage && localStorage.getItem("passport");
    },
    removePassport: function () {
        if (localStorage && localStorage.getItem("passport"))
            localStorage.removeItem("passport");
    }
});

_.extend(exports, {
    LoginPageModel: LoginPageModel
});
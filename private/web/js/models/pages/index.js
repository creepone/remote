var _ = require("../../lib/underscore"),
    Backbone = require("../../lib/backbone"),
    services = require("./../services"),
    Slave = require("./../slave").Slave;

var IndexPageModel = Backbone.Model.extend({
    properties: "settings,slaves,slaveToken",
    constructor: function(o) {
        var Slaves = Backbone.Collection.extend({ 
            model: Slave,
            url: "/slaves",
            comparator: "name"
        });
        o.slaves = new Slaves(o.slaves || []);
        Backbone.Model.apply(this, arguments);
    },

    logout: function () {
        return services.logout()
            .then(function () {
                if (localStorage && localStorage.getItem("passport"))
                    localStorage.removeItem("passport");

                window.location.href = "/";
            });
    },
    getPrettySettings: function () {
        var value = this.settings;
        return value ? JSON.stringify(value, null, 4) : "";
    },
    saveSettings: function (jsonValue) {
        var self = this;

        return Q.try(function () { return JSON.parse(jsonValue); })
            .then(function (settings) {
                return services.saveSettings(settings)
                    .then(function () {
                        self.slaves.fetch();
                        self.settings = settings;
                    });
            });
    }
});

_.extend(exports, {
    IndexPageModel: IndexPageModel
});
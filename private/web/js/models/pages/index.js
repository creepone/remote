var _ = require("underscore"),
    Backbone = require("backbone"),
    ajax = require("../../services/ajax"),
    Slave = require("../slave").Slave,
    Executions = require("../executions").Executions;

var Slaves = Backbone.Collection.extend({
    model: Slave,
    url: "/slaves",
    comparator: "name"
});

var IndexPageModel = Backbone.Model.extend({
    properties: "settings,slaves,slaveToken",
    initialize: function() {
        this.slaves = new Slaves(this.slaves || []);
        this.executions = new Executions([]);
        // TODO: this.executions.fetch({ data: { limit: 5, skip: 5 } });
    },

    logout: function () {
        return ajax.logout()
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
                return ajax.saveSettings(settings)
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
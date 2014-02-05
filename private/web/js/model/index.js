var _ = require("../lib/underscore"),
    Backbone = require("../lib/backbone"),
    commands = require("./commands"),
    services = require("./services"),
    tools = require("./tools");
   
var Slave = Backbone.Model.extend({
    idAttribute: "name",

    isCommandExecuting: function (index) {
        var o = this._commandOptions(index);
        return commands.isExecuting(o);
    },
    executeCommand: function (index) {
        var o = this._commandOptions(index);
        return commands.execute(o)
            .then(function (result) {
                return { name: o.slave + " / " + o.command.displayName, result: result };
            });
    },

    _commandOptions: function (index) {
        return {
            slave: this.get("name"),
            command: this.get("commands")[index]
        };
    }
});
   
var IndexPageModel = Backbone.Model.extend({
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
        var value = this.get("settings");
        return value ? JSON.stringify(value, null, 4) : "";
    },
    saveSettings: function (jsonValue) {
        var self = this;

        return Q.try(function () { return JSON.parse(jsonValue); })
            .then(function (settings) {
                return services.saveSettings(settings)
                    .then(function () {
                        self.get("slaves").fetch();
                        self.set("settings", settings);
                    });
            });
    }
});

_.extend(exports, {
    IndexPageModel: IndexPageModel
});
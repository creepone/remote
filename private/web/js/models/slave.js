var _ = require("underscore"),
    Backbone = require("backbone"),
    commands = require("../services/commands");

var Slave = Backbone.Model.extend({
    properties: "name,commands",
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
            slave: this.name,
            command: this.commands[index]
        };
    }
});

_.extend(exports, {
    Slave: Slave
});
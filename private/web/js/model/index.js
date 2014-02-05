var _ = require("../lib/underscore"),
    Backbone = require("../lib/backbone"),
    commands = require("./commands"),
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
                tools.reportSuccess(o.slave + " / " + o.command.displayName, result);
            },
            tools.reportError)
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
    }
});

_.extend(exports, {
    IndexPageModel: IndexPageModel
});
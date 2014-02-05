var _ = require("underscore"),
    path = require("path"),
    util = require("util"),
    events = require("events"),
    fs = require("fs"),
    spawn = require("child_process").spawn;

function Commands(o) {
    events.EventEmitter.call(this);
    _.extend(this, o);
    this._load();
}

util.inherits(Commands, events.EventEmitter);

_.extend(Commands.prototype, {
    getNames: function ()
    {
        return this._commands.map(function (cmd) { return cmd.name; });
    },
    execute: function (o)
    {
        var self = this,
            id = o.id;

        var command = _.find(this._commands, function (cmd) { return cmd.name === o.name; });
        if (!command)
            return this.emit("done", { id: id, error: new Error("Command handler not found.") });

        var runner = spawn("node", ["runner.js", "--script", command.script, "--args", JSON.stringify(o.args)]);

        var result = "";
        runner.stdout.setEncoding("utf8");
        runner.stdout.on("data", function (data) {
            result += data;
        });

        var error = "";
        runner.stderr.setEncoding("utf8");
        runner.stderr.on("data", function (data) {
            error += data;
        });

        runner.on("exit", function (code) {
            var msg = { id: id };
            if (code === 0)
                msg.result = result || "Done.";
            else
                msg.error = error || "Unknown error.";

            self.emit("done", msg);
        });
    },
    _load: function ()
    {
        var scripts = fs.readdirSync(__dirname + "/commands");

        var result = [];

        scripts.forEach(function (script) {
            if (path.extname(script) !== ".js")
                return;

            var Command = require("./commands/" + path.basename(script, ".js"));
            if (!Command.prototype)
                return;

            var name = Command.prototype.name;
            if (!name || typeof Command.prototype.execute !== "function")
                return;

            if (result.some(function (otherCommand) { return otherCommand.name === name; })) {
                console.log("Found duplicate command '" + name + "', ignoring.");
                return;
            }

            result.push({
                name: name,
                script: script
            });
        });

        this._commands = result;
    }
});

module.exports = Commands;
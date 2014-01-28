var _ = require("underscore"),
    fs = require("fs"),
    path = require("path"),
    io = require("socket.io-client"),
    argv = require('optimist').argv;


if (!argv.host || !argv.token || !argv.name)
{
    console.log("Usage: node app.js --host http://my.server.com:8080 --token 123456 --name MyPC");
    process.exit();
}

var socket = io.connect(argv.host),
    commands = loadCommands();

socket.emit("register", {
    name: argv.name,
    token: argv.token,
    commands: commands.map(function (Command) { return Command.prototype.name; })
});

// todo: reconnection options, handle other error events

socket.on("error", function (err) {
    console.log(err);
    process.exit(1);
});

socket.on("disconnect", function () {
    console.log("Server disconnected.")
    process.exit(1);
});

socket.on("command", function (o) {
    var id = o.id;

    var Command = _.find(commands, function (cmd) { return cmd.prototype.name === o.name; });
    if (!Command)
        return socket.emit("done", { error: new Error("Command handler not found.") });

    var cmd = new Command(o.args);
    cmd.execute()
        .done(function (result) {
            socket.emit("done", { result: result });
        },
        function (error) {
            socket.emit("done", { error: error });
        });
});

function loadCommands()
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

        // todo: check duplicate names
        if (result.some(function (OtherCommand) { return OtherCommand.prototype.name === name; })) {
            console.log("Found duplicate command '" + name + "', ignoring.");
            return;
        }

        result.push(Command);
    });

    return result;
}
var _ = require("underscore"),
    fs = require("fs"),
    path = require("path"),
    argv = require('optimist').argv,
    Dispatcher = require("./dispatcher"),
    Commands = require("./commands");

if (!argv.host || !argv.token || !argv.name)
{
    console.log("Usage: node app.js --host http://my.server.com:8080 --token 123456 --name MyPC");
    process.exit();
}

var commands = new Commands();

var dispatcher =  new Dispatcher(_.extend(_.pick(argv, "host", "token", "name"), {
    commands: commands
}));

commands.on("done", function (o) {
    dispatcher.notify(o);
});

process.on("uncaughtException", function (err) {
    console.error(err.stack);
    dispatcher.reset();
});

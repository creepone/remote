var io = require("socket.io-client"),
    argv = require('optimist').argv;


if (!argv.host || !argv.token || !argv.name)
{
    console.log("Usage: node app.js --host http://my.server.com:8080 --token 123456 --name MyPC");
    process.exit();
}

var socket = io.connect(argv.host);

// todo: find available commands and send with register

socket.emit("register", {
    name: argv.name,
    token: argv.token
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

socket.on("command", function (command) {
    console.log(command);

    // todo: find the command handler and execute
    // todo: when done, emit "done" event
});


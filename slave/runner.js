var _ = require("underscore"),
    path = require("path"),
    argv = require('optimist').argv;

var script = argv.script,
    args = JSON.parse(argv.args);

var Command = require("./commands/" + path.basename(script, ".js"));

var cmd = new Command(args);
cmd.execute()
    .done(function (result) {
        console.log(JSON.stringify(result));
        exit(0);
    },
    function (error) {
        console.log(error);
        exit(1);
    });

function exit(code)
{
    process.stdout.once("drain", function () { process.exit(code); });
    process.stdout.write("");
}

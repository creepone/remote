var Q = require("q");

function ExampleCommand(args) {
    this.args = args;
}

ExampleCommand.prototype.name = "Example";

ExampleCommand.prototype.execute = function () {
    return Q(42).delay(5000);
};

module.exports = ExampleCommand;
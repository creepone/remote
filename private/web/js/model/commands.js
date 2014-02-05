var $ = require("../lib/jquery"),
    Q = require("../lib/q.min"),
    services = require("./services");

var queue = [];

function getCommandResult(commandId, retries) {
    if (!retries)
        throw new Error("Command timed out.");

    return services.getCommandResult(commandId)
        .then(function (res) {
            if (res && res.done)
                return res.result;

            retries--;
            return getCommandResult(commandId, retries);
        });
}

$.extend(exports, {
    execute: function (o) {
        if (this.isExecuting(o))
            throw new Error("Command already being executed");

        queue.push(o);

        return services.executeCommand(o)
            .then(function (cmd) {
                return getCommandResult(cmd.id, 3);
            })
            .finally(function() {
                queue = queue.filter(function (cmd) { return cmd !== o });
            });
    },
    isExecuting: function (o) {
        return queue.some(function (cmd) {
            return cmd.slave === o.slave && cmd.command.name === o.command.name;
        });
    }
});

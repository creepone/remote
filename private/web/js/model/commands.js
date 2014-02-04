var $ = require("../lib/jquery"),
    Q = require("../lib/q.min"),
    services = require("./services");

var queue = [];

function tryGetResult(commandId, limit) {
    var start = +new Date();
    if (start > limit)
        throw new Error("Command timed out.");

    return services.getCommandResult(commandId)
        .then(function (res) {
            if (res && ("result" in res))
                return res.result;
            else {
                var end = +new Date();
                var gap = Math.max(0, 2000 + start - end);
                return Q.delay(gap).then(tryGetResult.bind(null, commandId, limit));
            }
        });
}

$.extend(exports, {
    execute: function (o) {
        if (this.isExecuting(o))
            throw new Error("Command already being executed");

        queue.push(o);

        return services.executeCommand(o)
            .then(function (cmd) {
                return tryGetResult(cmd.id, + new Date() + 15000);
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

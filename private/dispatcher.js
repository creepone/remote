var db = require("./db"),
    _ = require("underscore"),
    Q = require("q"),
    ObjectID = require("mongodb").ObjectID;

var slaves = [];

exports.init = function (io) {
    io.on("connection", function (socket) {
        socket.on("register", function (data) {
            registerSlave(data, socket).done();
        });

        socket.on("done", onCommandDone);
        socket.on("disconnect", unregisterSlave.bind(null, socket));
    });
};

exports.slaves = function (user) {
    return slaves.filter(function (slave) {
        return slave.user._id.equals(user._id);
    })
    .map(function (slave) {
        var res = _.extend({}, slave);
        delete res.socket;
        return res;
    });
};

exports.execute = function (req, res) {
    var slave = _.find(slaves, function (s) { return s.name === req.body.slave && s.user._id.equals(req.user._id); });
    if (!slave)
        throw new Error("Slave not found.");

    var id = new ObjectID();

    var execution = {
        _id: id,
        timestamp: +new Date(),
        slave: req.body.slave,
        command: req.body.command
    };

    return db.insertExecution(execution)
        .then(function () {
            var o = _.extend({ id: id.toString() }, req.body.command);
            slave.socket.emit("command", o);
            res.send({ id: id });
        });
};

exports.getCommandResult = function (req, res) {
    // repeatedly try to get the result within a time limit of 5s
    return tryGetResult(new ObjectID(req.params.id), +new Date() + 5000)
        .then(function (result) {
            res.send(result);
        });
};

function registerSlave(o, socket) {
    return db.getUser({ slaveToken: o.token })
        .then(function (user) {
            if (!user) {
                socket.disconnect();
                return;
            }

            slaves.push({
                user: user,
                name: findUniqueName(o.name),
                commands: o.commands,
                socket: socket
            });
        });
}

function findUniqueName(name) {
    var duplicate = _.find(slaves, function (slave) { return slave.name == name; });
    if (!duplicate)
        return name;

    var pattern = /^ \((\d+)\)$/;
    var maxIndex = _.max(slaves.map(function (slave) {
        if (slave.name.indexOf(name) !== 0)
            return 0;

        var matches = slave.name.substr(name.length).match(pattern);
        return matches ? +matches[1] : 0;
    }));

    maxIndex++;
    return name + " (" + maxIndex + ")";
}

function unregisterSlave(socket) {
    slaves = slaves.filter(function (slave) { return slave.socket !== socket; });
}

function onCommandDone(o) {
    var $set = _.pick(o, "error", "result");
    db.updateExecution({ _id: new ObjectID(o.id) }, { $set: $set }).done();
}

function tryGetResult(executionId, timeLimit) {
    var start = +new Date();
    if (start > timeLimit)
        return Q({ done: false });
    
    return db.getExecution({ _id: executionId })
       .then(function (execution) {
           if (execution.error)
               throw new Error(execution.error);
           else if ("result" in execution)
               return { result: execution.result, done: true };

           return Q.delay(500).then(tryGetResult.bind(null, executionId, timeLimit));
       });
}
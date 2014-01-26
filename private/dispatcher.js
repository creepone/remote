var db = require("./db"),
    _ = require("underscore");

var slaves = [];

exports.init = function (io) {
    io.on("connection", function (socket) {
        socket.on("register", function (data) {
            registerSlave(data, socket).done();
        });

        socket.on("disconnect", unregisterSlave.bind(null, socket));
    });
};

exports.slaves = function(user) {
    return slaves.filter(function (slave) {
        return slave.user._id.equals(user._id);
    })
    .map(function (slave) {
        var res = _.extend({}, slave);
        delete res.socket;
        return res;
    });
}

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
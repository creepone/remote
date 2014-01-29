var _ = require("underscore"),
    io = require("socket.io-client");

function Dispatcher(o) {
    _.extend(this, o);
    this._notifyQueue = [];
    this._connect();
}

_.extend(Dispatcher.prototype, {
    notify: function (o)
    {
        var self = this;

        // todo: persist the notify queue into a sqlite db
        if (o)
            this._notifyQueue.push(o);

        if (!this.socket)
            return;

        var notified = [];

        this._notifyQueue.forEach(function (item) {
            try { self.socket.emit("done", item); }
            catch(e) { return; }

            notified.push(item);
        });

        this._notifyQueue = this._notifyQueue.filter(function (item) { return notified.indexOf(item) < 0; });
    },
    reset: function()
    {
        this.socket = null;
        setTimeout(this._connect.bind(this), 60000);
    },
    _connect: function () {
        console.log("(Re)connecting to the server...");

        var socket, self = this;

        try {
            socket = io.connect(this.host, {
                reconnect: false,
                "force new connection": true
            });
        }
        catch (e) {
            console.log("Connection failed.");
            return scheduleReconnect();
        }

        socket.on("connect", function () {
            if (self.socket !== socket) return;

            console.log("Connected.");

            socket.emit("register", {
                name: self.name,
                token: self.token,
                commands: self.commands.getNames()
            });

            self.notify();
        });

        socket.on("error", function (err) {
            if (self.socket !== socket) return;

            console.log("Connection error.")
            self.reset();
        });

        socket.on("disconnect", function () {
            if (self.socket !== socket) return;

            console.log("Server disconnected.")
            self.reset();
        });

        socket.on("command", function (o) {
            if (self.socket !== socket) return;

            self.commands.execute(o);
        });

        this.socket = socket;
    }
});

module.exports = Dispatcher;

var dispatcher = require("../dispatcher"),
    _ = require("underscore"),
    db = require("../db");

exports.render = function (req, res) {
    if (!req.user)
        return res.render("index", { data: {} });

    db.getSettings({ userId: req.user._id })
        .done(function (result) {
            var slaves = dispatcher.slaves(req.user),
                settings = result && result.body;

            res.render("index", {
                data: {
                    username: req.user.displayName(),
                    slaveToken: req.user.slaveToken,
                    slaves: convertSlaves(slaves, settings),
                    settings: settings
                }
            });
        },
        function (err) {
            console.log(err);
            res.send(500);
        });
};

exports.saveSettings = function (req, res) {
    db.getSettings({ userId: req.user._id })
        .then(function (settings) {
            if (settings)
                return db.updateSettings({ userId: req.user._id }, {
                    $set: { body: req.body.settings }
                });

            return db.insertSettings({
                userId: req.user._id,
                body: req.body.settings
            });
        })
        .done(function () {
            res.send({});
        },
        function (err) {
            console.log(err);
            res.send({ error: "Could not save the settings." });
        })
};


function convertSlaves(slaves, settings) {
    return slaves.map(function (slave) {
        var result = { name: slave.name, commands: slave.commands.map(convertCommand) };

        if (!settings || !settings.slaves)
            return result;

        var slaveSettings = _.find(settings.slaves, function (s) { return slave.name.match(new RegExp(s.name)); });
        if (!slaveSettings || !slaveSettings.commands)
            return result;

        result.commands = slaveSettings.commands;
        return result;
    });
}

function convertCommand(command) {
    return {
        name: command,
        displayName: command,
        args: {}
    };
}

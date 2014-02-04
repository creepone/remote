var  _ = require("underscore"),
    dispatcher = require("../dispatcher"),
    db = require("../db");

// o = { user: ..., settings: ... }
function find(o) {
    var slaves = dispatcher.slaves(o.user),
        settingsPromise = o.settings ? Q(o.settings) :
            db.getSettings({ userId: o.user._id }).then(function (s) { return s && s.body; });
        
     return settingsPromise
        .then(function (settings) {
            return convertSlaves(slaves, settings);
        });
};
      
_.extend(exports, {
    find: find,
    routes: {
        get: function (req, res) {
            return find({ user: req.user })
                .then(function (slaves) {
                    res.send(slaves);
                });
        }
    }   
});

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
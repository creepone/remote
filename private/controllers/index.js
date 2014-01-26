var dispatcher = require("../dispatcher");

exports.render = function (req, res) {
    if (!req.user)
        return res.render("index", { data: {} });

    res.render("index", {
        data: {
            username: req.user.displayName(),
            slaveToken: req.user.slaveToken,
            slaves: dispatcher.slaves(req.user)
        }
    });
};
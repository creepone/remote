var db = require("../db");

exports.render = function (req, res) {
    if (!req.user)
        return res.render("index", { data: {} });

    res.render("index", {
        data: {
            username: req.user.displayName(),
            slaveToken: req.user.slaveToken
        }
    });
};
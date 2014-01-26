var db = require("../db");

exports.render = function (req, res) {
    res.render("login", { data: { } });
};
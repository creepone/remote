var db = require("../db");

exports.render = function (req, res) {
    res.render("login", { data: {
        providers: {
            "google": { url: "/login/google", image: "/img/google.png" }
        }
    } });
};
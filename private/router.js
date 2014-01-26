var authentication = require("./authentication"),
    index = require("./controllers/index"),
    login = require("./controllers/login"),
    register = require("./controllers/register");

var routes = [
    // web services
    { path: "/logout", method: authentication.logout, verb: "POST" },
    { path: "/login", method: authentication.login.local, verb: "POST" },
    { path: "/login/google", method: authentication.login.google.init },
    { path: "/login/google/return", method: authentication.login.google["return"] },
    { path: "/register/google", method: authentication.register.google.init },
    { path: "/register/google/return", method: authentication.register.google["return"] },

    // web pages
    { path: "/", method: index.render },
    { path: "/login", method: login.render },
    { path: "/register", method: register.render },
    { path: "/register", method: register.post, verb: "POST" }
];

exports.init = function(app)
{
    app.use(app.router);

    routes.forEach(function(route) {
        var verb = (route.verb || "GET").toLowerCase();
        app[verb](route.path, route.method);
    });
};
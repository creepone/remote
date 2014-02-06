var Q = require("q"),
    authentication = require("./authentication"),
    index = require("./controllers/index"),
    login = require("./controllers/login"),
    register = require("./controllers/register"),
    dispatcher = require("./dispatcher"),
    slaves = require("./models/slaves");

var routes = {
    endpoints: [
        { path: "/logout", method: authentication.logout, verb: "POST" },
        { path: "/login", method: authentication.login.local, verb: "POST", anonymous: true },
        { path: "/register", method: register.post, verb: "POST", anonymous: true },
        { path: "/dispatcher/execute", method: dispatcher.execute, verb: "POST" },
        { path: "/dispatcher/execute/result/:id", method: dispatcher.getCommandResult },
        { path: "/slaves", method: slaves.routes.get },
        { path: "/settings", method: index.saveSettings, verb: "PUT" }
    ],

    pages: [
        { path: "/", method: index.render },
        { path: "/login", method: login.render, anonymous: true },
        { path: "/login/google", method: authentication.login.google.init, anonymous: true },
        { path: "/login/google/return", method: authentication.login.google["return"], anonymous: true },
        { path: "/register/google", method: authentication.register.google.init, anonymous: true },
        { path: "/register/google/return", method: authentication.register.google["return"], anonymous: true },
        { path: "/register", method: register.render, anonymous: true }
    ]   
};

exports.init = function(app)
{
    app.use(app.router);

    routes.endpoints.forEach(function(route) { register(route, authentication.filterService); });
    routes.pages.forEach(function(route) { register(route, authentication.filterPage); });

    function register(route, filter) {
        var verb = (route.verb || "GET").toLowerCase();
        var args = [route.path];
        if (!route.anonymous)
            args.push(filter);  

        args.push(function (req, res, next) {
            Q.try(function () { return route.method(req, res); })
                .catch(function (err) {
                    console.log(err);
                    res.send(500, err.toString());
                });
        });

        app[verb].apply(app, args);
    }
};
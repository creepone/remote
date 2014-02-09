var $ = require("jquery"),
    _ = require("underscore"),
    Q = require("q");

function ajax(o) {
    return Q($.ajax(o))
        .then(_.identity,
            function (res) {
                if (res.status == 403)
                    window.location.href = "/login";
                else
                    throw new Error(res.responseText || "Unknown error");
            });
}

$.extend(exports, {
    ajax: ajax,
    login: function (credentials) {
        return ajax({
            type: "POST",
            url: "/login",
            dataType: "json",
            data: JSON.stringify(credentials),
            contentType: "application/json; charset=utf-8"
        });
    },
    register: function (user) {
        return ajax({
            type: "POST",
            url: "/register",
            dataType: "json",
            data: JSON.stringify({ user: user }),
            contentType: "application/json; charset=utf-8"
        });
    },
    saveSettings: function(settings) {
        return ajax({
            type: "PUT",
            url: "/settings",
            dataType: "json",
            data: JSON.stringify({ settings: settings }),
            contentType: "application/json; charset=utf-8"
        });
    },
    executeCommand: function (command) {
        return ajax({
            type: "POST",
            url: "/dispatcher/execute",
            dataType: "json",
            data: JSON.stringify(command),
            contentType: "application/json; charset=utf-8"
        });
    },
    getCommandResult: function (commandId) {
        return ajax({
            type: "GET",
            url: "/dispatcher/execute/result/" + commandId,
            dataType: "json"
        });
    },
    logout: function () {
        return ajax({
            type: "POST",
            url: "/logout",
            dataType: "json"
        })
    }
});
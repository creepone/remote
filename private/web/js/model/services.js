var $ = require("../lib/jquery"),
	Backbone = require("../lib/backbone"),
	tools = require("./tools"),
    Q = require("../lib/q.min");

function ajax(o) {
    return Q($.ajax(o))
        .then(function (data) {
            if (data.error)
                throw new Error(data.error); // todo: remove this when possible
            else
                return data;
        }, 
        function (res) {
            if (res.status == 403)
                window.location.href = "/login";
            else if (res.status == 500)
                throw new Error(res.responseText);
        });
}

Backbone.ajax = function (o) {
    ajax(o).catch(function (err) {
        tools.reportError(err);
    });
};

$.extend(exports, {
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
            type: "POST",
            url: "/settings/save",
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
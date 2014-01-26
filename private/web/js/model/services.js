var $ = require("../lib/jquery"),
    Q = require("../lib/q.min");

function ajax(o) {
    return Q($.ajax(o))
        .then(function (data) {
            if (data.error)
                throw new Error(data.error);
            else
                return data;
        });
}

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
    logout: function () {
        return ajax({
            type: "POST",
            url: "/logout",
            dataType: "json"
        })
    }
});
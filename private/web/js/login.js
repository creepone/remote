var $ = require("./lib/jquery"),
    Q = require("./lib/q.min"),
    tools = require("./model/tools"),
    services = require("./model/services");

require("./lib/bootstrap");

$(function() {
    $("button[type='submit']").click(onLoginClick);
    $("[name='email']").focus();

    var uri = tools.parseUri(location);
    if (uri.queryKey && uri.queryKey.fail)
        tools.reportError("Provider login failed : " + uri.queryKey.fail);
});

function onLoginClick(event)
{
    event.preventDefault();

    services.login({
        username: $("[name='email']").val(),
        password: $("[name='password']").val()
    })
    .done(function () {
        window.location.href = "/";
    },
    tools.reportError);
}
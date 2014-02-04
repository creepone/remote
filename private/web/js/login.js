var $ = require("./lib/jquery"),
    Q = require("./lib/q.min"),
    tools = require("./model/tools"),
    services = require("./model/services");

require("./lib/bootstrap");

$(function () {
    var uri = tools.parseUri(location);
    if (uri.queryKey && uri.queryKey.fail)
        onLoginFailed(uri.queryKey.fail); 
    else if (autoAuthenticate())
        return;

    createView();
});


function createView()
{
    $("button[type='submit']").click(onLoginClick);
    $("[name='email']").focus();

    $("[data-passport]").click(onPassportClick);
}

function autoAuthenticate()
{
    var passport = localStorage && localStorage.getItem("passport");
    if (!passport)
        return false;
    
    var url = $("[data-passport=\"" + passport + "\"]").attr("href");
    if (url)
    {
        window.location.href = url;
        return true;
    }

    return false;
}

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

function onPassportClick(event)
{
    var passport = $(this).attr("data-passport");
    if (localStorage)
        localStorage.setItem("passport", passport);
}

function onLoginFailed(provider)
{
	if (localStorage && localStorage.getItem("passport"))
        localStorage.removeItem("passport");
	tools.reportError("Provider login failed : " + provider); 
}
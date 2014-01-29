var $ = require("./lib/jquery"),
    Q = require("./lib/q.min"),
    tools = require("./model/tools"),
    services = require("./model/services"),
    commands = require("./model/commands");

require("./lib/bootstrap");

$(function() {
    _data = JSON.parse($(".data").html());

    if (!_data.username) {
        window.location.href = "/login";
        return;
    }

    _createView();
});

function _createView()
{
    // reveal all the user-dependent UI
    $("#loader").hide();
    $(".needs-user").removeClass("needs-user");

    $("#logout").click(onLogoutClick);

    $("[data-command]").click(onCommandClick);
}

function onLogoutClick(event)
{
    event.preventDefault();

    services.logout()
        .done(function () {
            if (localStorage && localStorage.getItem("passport"))
                localStorage.removeItem("passport");

            window.location.href = "/";
        },
        tools.reportError);
}

function onCommandClick(event)
{
    var $el = $(this);

    var slave = $el.closest("[data-slave]").attr("data-slave");
    var command = $el.attr("data-command");
    var o = { slave: slave, command: { name: command, args: {} }};

    if (commands.isExecuting(o))
        return;

    $el.addClass("busy");

    commands.execute(o)
        .then(function (result) {
            var $alert = $("<div />").addClass("alert alert-success fade in");
            $("<button />").attr({ type: "button", "data-dismiss": "alert" }).addClass("close").html("&times;").appendTo($alert);
            $("<b />").text(slave + " / " + command).appendTo($alert);
            $("<br />").appendTo($alert);
            $("<span />").text(result).appendTo($alert);

            $(".container").prepend($alert);
            $alert.alert();
        },
        tools.reportError)
        .finally(function () {
            $el.removeClass("busy");
        })
        .done();
}

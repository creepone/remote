var $ = require("./lib/jquery"),
    Q = require("./lib/q.min"),
    tools = require("./model/tools"),
    services = require("./model/services");

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
}

function onLogoutClick(event)
{
    event.preventDefault();

    services.logout()
        .done(function () {
            window.location.href = "/";
        },
        tools.reportError);
}
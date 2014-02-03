var $ = require("./lib/jquery"),
    Q = require("./lib/q.min"),
    CodeMirror = require("./lib/codemirror"),
    tools = require("./model/tools"),
    services = require("./model/services"),
    commands = require("./model/commands");

require("./lib/bootstrap");
require("./lib/codemirror_javascript");

var IndexPage = require("./model/index").IndexPage;

var _settingsArea;

$(function() {
    _data = JSON.parse($(".data").html());
    window._model = new IndexPage(_data, { parse: true });

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
    $("#settings").click(onSettingsClick);
    $("#saveSettings").click(onSaveSettingsClick);

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
    var args = $el.attr("data-args");
    args = args ? JSON.parse(args) : {};

    var caption = $el.attr("data-caption");

    var o = { slave: slave, command: { name: command, args: args }};

    if (commands.isExecuting(o))
        return;

    $el.addClass("busy");

    commands.execute(o)
        .then(function (result) {
            tools.reportSuccess(slave + " / " + caption, result);
        },
        tools.reportError)
        .finally(function () {
            $el.removeClass("busy");
        })
        .done();
}

function onSettingsClick(event)
{
    _settingsArea = _settingsArea || CodeMirror.fromTextArea($("#settingsJson")[0], {
        mode: { name: "javascript", json: true },
        autofocus: true
    });

    var value = _data.settings ? JSON.stringify(_data.settings, null, 4) : "";
    _settingsArea.setValue(value);

    $(".modal").modal("show");
    $(".modal").on("shown.bs.modal", function () {
        _settingsArea.refresh();
    });
}

function onSaveSettingsClick(event)
{
    var settings, json = _settingsArea.getValue();
    try {
        settings = JSON.parse(json);
    }
    catch (err) {
        return tools.reportError(err, $(".modal-body"));
    }

    services.saveSettings(settings)
        .done(function () {
            $(".modal").modal("hide");
            window.location.reload();
        },
        function (err) {
            tools.reportError(err, $(".modal-body"));
        });
}
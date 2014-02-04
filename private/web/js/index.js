var $ = require("./lib/jquery"),
    CodeMirror = require("./lib/codemirror"),
    tools = require("./model/tools"),
    services = require("./model/services");

require("./lib/bootstrap");
require("./lib/codemirror_javascript");

var IndexPageModel = require("./model/index").IndexPageModel,
    IndexPageView = require("./views/index").IndexPageView;

var _settingsArea;

$(function() {
    _data = JSON.parse($(".data").html());

    // todo: extend the container from #slaves to the entire page, refactor the rest

    var page = new IndexPageView({ 
        model: new IndexPageModel(_data), 
        el: $("#slaves")[0] 
    });

    page.render();

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
var $ = require("../lib/jquery"),
    Q = require("../lib/q.min");

$(function () {
    // reveal all the ui (preventing flash of unstyled content)
    $(".fouc").removeClass("fouc");
})

exports.parseUri = function(str) {

    // parseUri 1.2.2
    // (c) Steven Levithan <stevenlevithan.com>
    // MIT License

    var o = {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   {
            name:   "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    };

    var m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
};

exports.reportError = function(error) {
    var msg = "Error occured when communicating with the server.";

    if (typeof error == "string")
        msg = error;
    else if (error.message)
        msg = error.message;

    $("#alert").html("<div class=\"alert alert-danger fade in\">" +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>" +
        msg + "</div>");

    setTimeout(function () { $("#alert .alert").alert("close"); }, 2000);
    console.log(error);
};

exports.reportSuccess = function(title, message) {
    var $alert = $("<div />").addClass("alert alert-success fade in");
    $("<button />").attr({ type: "button", "data-dismiss": "alert" }).addClass("close").html("&times;").appendTo($alert);
    $("<b />").text(title).appendTo($alert);
    $("<br />").appendTo($alert);
    $("<span />").text(message).appendTo($alert);

    $(".container").prepend($alert);
    $alert.alert();
    $alert.click(function () { $alert.alert("close"); });
};
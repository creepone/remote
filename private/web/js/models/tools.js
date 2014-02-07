var $ = require("../lib/jquery"),
    Q = require("../lib/q.min"),
    _ = require("../lib/underscore"),
    Backbone = require("../lib/backbone");

$(function () {
    // reveal all the ui (preventing flash of unstyled content)
    $(".fouc").removeClass("fouc");
});

$.fn.insertAt = function (index, element) {
    if (index === 0)
        this.prepend(element);
    else if (index > this.children().length)
        this.append(element);
    else
        this.children(":nth-child(" + index + ")").after(element);
    return this;
};

Backbone.Model.extend = (function (extend) {
    return function (o) {
        // call base version
        var constructor = extend.apply(Backbone.Model, [].slice.apply(arguments));

        var properties = o.properties;
        if (typeof (properties) == "string")
            properties = properties.split(",");
        if (_.isArray(properties))
            properties = _.object(properties.map(function (p) { return [p, {}]; }));

        if (!properties)
            return constructor;

        Object.keys(properties).forEach(function (key) {
            $.extend(properties[key],
            {
                get: _.partial(constructor.prototype.get, key),
                set: _.partial(constructor.prototype.set, key)
            });
        });

        Object.defineProperties(constructor.prototype, properties);
        return constructor;
    };
})(Backbone.Model.extend);

Backbone.Model.prototype.save = (function (save) {
    return function (key, val, options) {
        var deferred = Q.defer(),
            args = [].slice.apply(arguments);

        var optionsIndex = (key == null || typeof key === 'object') ? 1 : 2;
        args[optionsIndex] = _.extend(args[optionsIndex] || {}, {
            success: function (model, res, options) { deferred.resolve(); },
            error: function (model, xhr, options) { deferred.reject(); }
        });
        save.apply(this, args);
        return deferred.promise;
    };
})(Backbone.Model.prototype.save);


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

exports.reportError = function(error, $container) {
    $container = $container || $(".container");

    var message;
    if (typeof error == "string")
        message = error;
    else if (error.message)
        message = error.message;
    else
        message = "Error occured when communicating with the server.";

    var $alert = $("<div />").addClass("alert alert-danger fade in");
    $("<button />").attr({ type: "button", "data-dismiss": "alert" }).addClass("close").html("&times;").appendTo($alert);
    $("<span />").text(message).appendTo($alert);

    $container.prepend($alert);
    $alert.alert();
    $alert.click(function () { $alert.alert("close"); });

    setTimeout(function () { $alert.alert("close"); }, 5000);
    console.log(error);
};

exports.reportSuccess = function(title, message, $container) {
    $container = $container || $(".container");

    var $alert = $("<div />").addClass("alert alert-success fade in");
    $("<button />").attr({ type: "button", "data-dismiss": "alert" }).addClass("close").html("&times;").appendTo($alert);
    $("<b />").text(title).appendTo($alert);
    $("<br />").appendTo($alert);
    $("<span />").text(message).appendTo($alert);

    $container.prepend($alert);
    $alert.alert();
    $alert.click(function () { $alert.alert("close"); });
};
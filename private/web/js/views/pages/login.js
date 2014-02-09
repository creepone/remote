var $ = require("jquery"),
    Backbone = require("backbone"),
    tools = require("../../services/tools"),
    LoginPageModel = require("../../models/pages/login").LoginPageModel;

// page script dependencies
require("bootstrap");

$(function () {
    var data = JSON.parse($(".data").html());

    var page = new Page({
        model: new LoginPageModel(data),
        el: document.body
    });

    page.render();
    window.page = page;
});

var Page = Backbone.View.extend({
    initialize: function () {
        $("[name='email']").focus();

        var uri = tools.parseUri(location);
        if (uri.queryKey && uri.queryKey.fail)
            this.reportLoginFailure(uri.queryKey.fail);
        else
            this.login("auto");
    },
    events: {
        "input input[name]": "onPropertyChange",
        "click [data-passport]": "onPassportClick",
        "submit form": "onFormSubmit"
    },

    render: function () {
        var template = _.template($("#providers-template").html(), { providers: this.model.providers });
        this.$el.find("#providers").html(template);
    },
    onPropertyChange: function (event) {
        var $el = $(event.currentTarget);
        var prop = $el.attr("name");
        this.model.set(prop, $el.val());
    },
    onPassportClick: function (event) {
        var passport = $(event.currentTarget).attr("data-passport");
        this.login(passport);
    },
    onFormSubmit: function (event) {
        event.preventDefault();
        this.login();
    },

    login: function (passport) {
        this.model.login(passport).done(function (url) {
            if (url)
                window.location.href = url;
        },
        tools.reportError);
    },
    reportLoginFailure: function (provider) {
        this.model.removePassport();
        tools.reportError("Provider login failed : " + provider);
    }
});
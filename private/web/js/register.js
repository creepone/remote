var $ = require("./lib/jquery"),
    Backbone = require("./lib/backbone"),
    tools = require("./models/tools"),
    services = require("./models/services"),
    RegisterPageModel = require("./models/pages/register").RegisterPageModel;

// page script dependencies
require("./lib/bootstrap");

$(function () {
    var data = JSON.parse($(".data").html());

    var page = new Page({
        model: new RegisterPageModel(data),
        el: document.body
    });

    page.render();
    window.page = page;
});

var Page = Backbone.View.extend({
    initialize: function () {
        var model = this.model;
        this.listenTo(model, "change", this.render);
        this.listenTo(model, "invalid", this.onModelInvalid);
    },
    events: {
        "input input[name]": "onPropertyChange",
        "submit form": "onFormSubmit",
        "blur input": "onInputBlur"
    },

    render: function () {
        var firstEmptyInput = this.$el.find("input").filter(function () { return !$(this).val(); })[0];
        $(firstEmptyInput).focus();
    },
    onPropertyChange: function (event) {
        var $el = $(event.currentTarget);
        var prop = $el.attr("name");
        this.model.set(prop, $el.val());
    },
    onInputBlur: function (event) {
        var $el = $(event.currentTarget);
        $el.popover("destroy");
    },
    onFormSubmit: function (event) {
        event.preventDefault();

        var $el = this.$el;
        Q(this.model.save())
            .done(function () {
                $el.find("form :input").attr({ disabled: true });
                $el.find(".alert-success").show();
            });
    },
    onModelInvalid: function (model, error) {
        var $field = $("input[name='" + error.name + "']");
        $field.focus()
            .popover({ content: error.message, placement: "bottom" })
            .popover("show");
    }
});


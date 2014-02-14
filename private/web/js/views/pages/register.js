var $ = require("jquery"),
    Backbone = require("backbone"),
    tools = require("../../services/tools"),
    RegisterPageModel = require("../../models/pages/register").RegisterPageModel;

// page script dependencies
require("bootstrap");

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

        var firstEmptyInput = this.$("input").filter(function () { return !$(this).val(); })[0];
        $(firstEmptyInput).focus();
    },
    events: {
        "input input[name]": "onPropertyChange",
        "submit form": "onFormSubmit",
        "blur input": "onInputBlur"
    },

    render: function () {
        // rendered server-side
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

        var $ = this.$;
        this.model.save()
            .done(function () {
                $("form :input").attr({ disabled: true });
                $(".alert-success").show();
            }, tools.reportError);
    },
    onModelInvalid: function (model, error) {
        var $field = $("input[name='" + error.name + "']");
        $field.focus()
            .popover({ content: error.message, placement: "bottom" })
            .popover("show");
    }
});


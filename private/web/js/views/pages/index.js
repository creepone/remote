var $ = require("jquery"),
    _ = require("underscore"),
    Q = require("q"),
    Backbone = require("backbone"),
    CodeMirror = require("codemirror"),
    tools = require("../../services/tools"),
    IndexPageModel = require("../../models/pages/index").IndexPageModel,
    SlaveView = require("../slave").SlaveView;

// page script dependencies
require("bootstrap");
require("codemirror-js");

$(function() {
    var data = JSON.parse($(".data").html());

    var page = new Page({
        model: new IndexPageModel(data), 
        el: document.body
    });

    page.render();
    window.page = page;
});

var Page = Backbone.View.extend({
    initialize: function () {
        var model = this.model;
        this.listenTo(model, "change", this.render);

        this.slaveViews = [];
        this.listenTo(model.slaves, "add", this.onSlaveAdd);
        this.listenTo(model.slaves, "remove", this.onSlaveRemove);

        this.$el.find("#loader").hide();
        setInterval(function () { model.slaves.fetch().catch(tools.reportError); }, 60000);
    },
    events: {
        "click #logout": "onLogoutClick",
        "click #settings": "onSettingsClick",
        "click #saveSettings": "onSaveSettingsClick",
        "shown.bs.modal .modal": "onModalShown"
    },
    onSlaveAdd: function (slave, slaves) {
        var index = slaves.indexOf(slave);

        var slaveView = new SlaveView({
            model: slave
        });

        this.$el.find("#slaves").insertAt(index, slaveView.el);
        this.slaveViews.splice(index, 0, slaveView);
        slaveView.render();
    },
    onSlaveRemove: function (slave, slaves) {
        var slaveView = _.find(this.slaveViews, function (v) { return v.model === slave; });
        slaveView.$el.remove();
        this.slaveViews = _.without(this.slaveViews, slaveView);
    },

    render: function () {
        var self = this;
        this.$el.find("#slaves").empty();

        var slaves = this.model.slaves;
        slaves.each(function (slave) {
            self.onSlaveAdd(slave, slaves);
        });
    },
    onLogoutClick: function (event) {
        event.preventDefault();
        this.model.logout().catch(tools.reportError);
    },
    onSettingsClick: function (event) {
        this._settingsArea = this._settingsArea || CodeMirror.fromTextArea(this.$el.find("#settingsJson")[0], {
            mode: { name: "javascript", json: true },
            autofocus: true
        });

        this._settingsArea.setValue(this.model.getPrettySettings());
        $(".modal").modal("show");
    },
    onSaveSettingsClick: function (event) {
        var $el = this.$el;

        this.model.saveSettings(this._settingsArea.getValue())
            .done(function () {
                $el.find(".modal").modal("hide");
            },
            function (err) {
                tools.reportError(err, $el.find(".modal-body"));
            });

    },
    onModalShown: function (event) {
        this._settingsArea.refresh();
        this._settingsArea.focus();
    }
});
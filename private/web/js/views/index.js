var $ = require("../lib/jquery"),
    _ = require("../lib/underscore"),
    Backbone = require("../lib/backbone"),
    CodeMirror = require("../lib/codemirror"),
    tools = require("../model/tools");

// page script dependencies
require("../lib/bootstrap");
require("../lib/codemirror_javascript");

var SlaveView = Backbone.View.extend({
    initialize: function() {
        this.listenTo(this.model, "change", this.render);
    },
    events: {
        "click [data-command]": "executeCommand"
    },
    render: function() {
        var template = _.template($("#slave-template").html(), { slave: this.model });
        var $el = $(template);

        this.$el.replaceWith($el);
        this.setElement($el[0]);
    },
    executeCommand: function (event) {
        var $el = $(event.currentTarget),
            index = $el.index();

        if (this.model.isCommandExecuting(index))
            return;

        $el.addClass("busy");
        this.model.executeCommand(index)
            .then(function (res) { tools.reportSuccess(res.name, res.result); }, tools.reportError)
            .finally(function () {
                $el.removeClass("busy");
            })
            .done();
    }
});

var IndexPageView = Backbone.View.extend({
    initialize: function () {
        var model = this.model;
        this.listenTo(model, "change", this.render);

        this.slaveViews = [];
        this.listenTo(model.get("slaves"), "add", this.onSlaveAdd);
        this.listenTo(model.get("slaves"), "remove", this.onSlaveRemove);

        setInterval(function () { model.get("slaves").fetch(); }, 60000);
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

        this.$el.find("#loader").hide();

        this.$el.find("#slaves").empty();
        var slaves = this.model.get("slaves");
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
    onSaveSettingsClick: function(event)
    {
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
    }
});

_.extend(exports, {
    IndexPageView: IndexPageView
});
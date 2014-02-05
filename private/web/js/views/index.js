var $ = require("../lib/jquery"),
    _ = require("../lib/underscore"),
    Backbone = require("../lib/backbone");
   
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
        var $el = $(event.target),
            index = $el.index();

        if (this.model.isCommandExecuting(index))
            return;

        $el.addClass("busy");
        this.model.executeCommand(index)
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
    onSlaveAdd: function (slave, slaves) {
        var index = slaves.indexOf(slave);

        var slaveView = new SlaveView({
            model: slave
        });

        this.$el.insertAt(index, slaveView.el);
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

        this.$el.empty();
        var slaves = this.model.get("slaves");
        slaves.each(function (slave) {
            self.onSlaveAdd(slave, slaves);
        });
    }
});

_.extend(exports, {
    IndexPageView: IndexPageView
});
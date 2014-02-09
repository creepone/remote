var $ = require("../lib/jquery"),
    _ = require("../lib/underscore"),
    Backbone = require("../lib/backbone"),
    tools = require("../services/tools");

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

_.extend(exports, {
    SlaveView: SlaveView
});
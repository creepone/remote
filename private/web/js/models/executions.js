var _ = require("underscore"),
    Backbone = require("backbone");

var Execution = Backbone.Model.extend({
    properties: "_id,timestamp,slave,command,result,error",
    idAttribute: "_id"
});

var Executions = Backbone.Collection.extend({
    model: Execution,
    url: "/executions",
    comparator: function (first, second) {
    	return second.timestamp - first.timestamp;
    }
});

_.extend(exports, {
    Executions: Executions
});
var _ = require("../lib/underscore"),
    Backbone = require("../lib/backbone");
   
var Slave = Backbone.Model.extend({
    
});
   
var IndexPage = Backbone.Model.extend({
    constructor: function(o) {
        var Slaves = Backbone.Collection.extend({ 
            model: Slave,
            url: "/slaves"
        });
        o.slaves = new Slaves(o.slaves || []);
        Backbone.Model.apply(this, arguments);
    }
});

_.extend(exports, {
    IndexPage: IndexPage
});
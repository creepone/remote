var  _ = require("underscore"),
    db = require("../db");

function find(o) {

	var settings = {
		lazy: false,
		sort: ["timestamp", "desc"],
		limit: o.limit,
		skip: o.skip
	};

	o = _.omit(o, "limit", "skip");
	return db.findExecutions(o, settings);
}

_.extend(exports, {
    routes: {
        get: function (req, res) {
        	return find({ 
        		userId: req.user._id,
        		limit: req.query.limit && +req.query.limit,
        		skip: req.query.skip && +req.query.skip
        	})
        	.then (function (executions) {
        		res.send(executions.map(convertExecution));
        	});
        }
    }   
});

function convertExecution(execution) {
    return _.omit(execution, "userId");
}
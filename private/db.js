var _ = require("underscore"),
    mongodb = require("mongodb"),
    Q = require("q");

_.extend(exports, {
    /*
     Queries the database for the user with properties specified in o.
     */
    getUser: function(o)
    {
        return _getCollection("users")
            .then(function (users) {
                var deferred = Q.defer();
                users.findOne(o, deferred.makeNodeResolver());
                return deferred.promise;
            });
    },

    /*
     Inserts the given user into the database.
     */
    insertUser: function(o)
    {
        return _getCollection("users")
            .then(function (users) {
                var deferred = Q.defer();
                users.insert(o, { w : 1 }, deferred.makeNodeResolver());
                return deferred.promise;
            });
    },

    /*
     Queries the database for the execution with properties specified in o.
     */
    getExecution: function(o)
    {
        return _getCollection("executions")
            .then(function (executions) {
                var deferred = Q.defer();
                executions.findOne(o, deferred.makeNodeResolver());
                return deferred.promise;
            });
    },

    /*
     Inserts the given execution into the database.
     */
    insertExecution: function(o)
    {
        return _getCollection("executions")
            .then(function (executions) {
                var deferred = Q.defer();
                executions.insert(o, { w : 1 }, deferred.makeNodeResolver());
                return deferred.promise;
            });
    },

    /*
     Updates the given execution in the database.
     */
    updateExecution: function(patch, o)
    {
        return _getCollection("executions")
            .then(function(executions) {
                var deferred = Q.defer();
                executions.findAndModify(patch, [], o, { w: 1 }, deferred.makeNodeResolver());
                return deferred.promise;
            });
    },

    /*
     Queries the database for the executions using the condition specified in o.
    */
    findExecutions: function(o, settings)
    {
        var res = _getCollection("executions")
            .then(function (executions) {
                var deferred = Q.defer();
                executions.find(o, deferred.makeNodeResolver());
                return deferred.promise;
            });

        return _applyCursorSettings(res, settings);
    },

    /*
     Queries the database for the settings with properties specified in o.
     */
    getSettings: function(o)
    {
        return _getCollection("settings")
            .then(function (settings) {
                var deferred = Q.defer();
                settings.findOne(o, deferred.makeNodeResolver());
                return deferred.promise;
            });
    },

    /*
     Inserts the given settings into the database.
     */
    insertSettings: function(o)
    {
        return _getCollection("settings")
            .then(function (settings) {
                var deferred = Q.defer();
                settings.insert(o, { w : 1 }, deferred.makeNodeResolver());
                return deferred.promise;
            });
    },

    /*
     Updates the given settings in the database.
     */
    updateSettings: function(patch, o)
    {
        return _getCollection("settings")
            .then(function(settings) {
                var deferred = Q.defer();
                settings.findAndModify(patch, [], o, { w: 1 }, deferred.makeNodeResolver());
                return deferred.promise;
            });
    }
});

var _db;
function _getDb()
{
    var deferred = Q.defer();

    if (_db)
        deferred.resolve(_db);
    else
        mongodb.Db.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/remote', function (err, db) {
            if (err) return deferred.reject(new Error(err));

            _db = db;
            deferred.resolve(db);
        });

    return deferred.promise;
}

function _getCollection(name)
{
    return _getDb()
        .then(function (db) {
            var deferred = Q.defer();
            db.collection(name, deferred.makeNodeResolver());
            return deferred.promise;
        });
}

function _applyCursorSettings(promise, settings)
{
    if (!settings)
        return promise;

    if (settings.sort)
        promise = promise.then(_sortCursor.bind(null, settings.sort));

    if (settings.skip)
        promise = promise.then(function (cursor) {
            return Q.ninvoke(cursor, "skip", settings.skip);
        });

    if (settings.limit)
        promise = promise.then(function (cursor) {
            return Q.ninvoke(cursor, "limit", settings.limit);
        });

    if (settings.lazy === false)
        promise = promise.then(_iterateCursor);

    return promise;
}

function _sortCursor(sortFields, cursor)
{
    var deferred = Q.defer();

    if (sortFields.length == 0)
        return cursor;
    else if (sortFields.length == 1)
        sortFields.push("asc");

    sortFields.push(deferred.makeNodeResolver());
    cursor.sort.apply(cursor, sortFields);
    return deferred.promise;
}

function _iterateCursor(cursor)
{
    var deferred = Q.defer();
    cursor.toArray(deferred.makeNodeResolver());
    return deferred.promise;
}
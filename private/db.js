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
    if (settings && settings.sort)
        promise = promise.then(_sortCursor.bind(null, settings.sort));

    if (settings && settings.lazy === false)
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
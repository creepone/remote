var db = require("./db"),
    Q = require("q"),
    crypto = require("crypto"),
    User = require("./models/users").User,
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    GoogleStrategy = require("passport-google").Strategy;

exports.init = function(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(createLocalStrategy());
    passport.use("google-login", createGoogleStrategy(app, "/login/google/return"));
    passport.use("google-register", createGoogleStrategy(app, "/register/google/return"));

    passport.serializeUser(function(user, done) {
        done(null, JSON.stringify(user));
    });

    passport.deserializeUser(function(user, done) {
        done(null, new User(JSON.parse(user)));
    });
}; 

exports.filterService = function(req, res, next) {
	if (req.user)
		return next();
	else
		res.send(403);
};  

exports.filterPage = function(req, res, next) {
	if (req.user)
		return next();
	else
		res.redirect("/login");
};

exports.login = {
    local: function (req, res) {
        var deferred = Q.defer();

        passport.authenticate("local", function (err, user) {

            if (err)
                return deferred.reject(err);
            else if (!user)
                return deferred.reject(new Error("Login failed"));

            req.login(user, function(err) {
                if (err)
                    return deferred.reject(err);

                res.json({});
                deferred.resolve();
            });

        })(req, res);

        return deferred.promise;
    },

    google: {
        init: passport.authenticate("google-login"),
        "return": passport.authenticate("google-login", {
            successRedirect: "/",
            failureRedirect: "/login?fail=Google"
        })
    }
};

exports.register = {
    google: {
        init: passport.authenticate("google-register"),
        "return": passport.authenticate("google-register", {
            successRedirect: "/",
            failureRedirect: "/register"
        })
    }
};

exports.logout = function(req, res) {
    req.logout();
    res.json({});
};

function createLocalStrategy() {
    return new LocalStrategy(
        function(email, password, done) {

            var passwordHash = crypto.createHash('md5').update(password).digest("hex");

            db.getUser({ email: email })
                .then(function (user) {
                    if (user && user.password === passwordHash)
                        done(null, new User(user));
                    else
                        done(null, false);
                },
                done.bind(null, null, false));
        }
    )
}

function createGoogleStrategy(app, returnUrl) {
    return new GoogleStrategy({
            returnURL: app.get("url") + returnUrl,
            realm: app.get("url"),
            passReqToCallback: true
        },
        function(req, identifier, profile, done) {

            db.getUser({ authToken: identifier })
                .then(function (user) {
                    if (user)
                        done(null, new User(user));
                    else {
                        req.session.registrationInfo = {
                            google: {
                                identifier: identifier,
                                profile: profile
                            }
                        };
                        done(null, false);
                    }
                },
                done.bind(null, null, false));
        });
}
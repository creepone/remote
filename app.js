var express = require("express"),
    jade = require("jade"),
    router = require("./private/router"),
    authentication = require("./private/authentication");
	
var app = express();

app.configure(function () {
    app.set("url", process.env.APP_URL)

    app.set("view engine", "jade");
    app.set("views", __dirname + "/private/web/views");
    app.engine("html", jade.__express);

    app.use(express.static(__dirname + "/public"));
    app.use(express.cookieParser());
	app.use(express.bodyParser());
    app.use(express.session({ secret: process.env.MONGOHQ_URL || "secret" }));

    authentication.init(app);
    router.init(app);
});

app.listen(process.env.PORT || 8082);
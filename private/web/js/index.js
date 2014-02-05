var $ = require("./lib/jquery"),
    IndexPageModel = require("./model/index").IndexPageModel,
    IndexPageView = require("./views/index").IndexPageView;

$(function() {
    var data = JSON.parse($(".data").html());

    var page = new IndexPageView({ 
        model: new IndexPageModel(data), 
        el: document.body
    });

    page.render();
});
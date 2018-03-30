var express = require("express");
var app = express();

var config = require("./server/config.js");

config.Middleware(app, express);
config.Route(app)

app.set('port', process.env.PORT || 6520);

app.listen(app.get('port'), function(){
    console.log("we are on " + app.get('port') + " again, GART" )
})
console.log("test")
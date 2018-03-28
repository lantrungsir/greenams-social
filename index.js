var express = require("express");
var app  = express();
var Route = require("./server/config/route.js");
var Middleware = require("./server/config/middleware.js");
//config
Route(app);
Middleware(app, express);
//run
app.set('port',process.env.PORT|| 1692 )
app.listen(app.get('port'), function(){
    console.log("we are on again, GART6520 on" + app.get('port'));
})
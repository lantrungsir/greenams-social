var express = require("express");
var app  =express();
var Route = require("./server/config/route.js");
var Middleware = require("./server/config/middleware.js");
//config
Route(app);
Middleware(app, express);
//run
app.listen(process.env.PORT || 1692, function(){
    console.log("we are on again, GART6520");
})
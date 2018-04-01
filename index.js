var express = require("express");
var app = express();

var config = require("./server/config.js");

var realtime = require("./server/realtime/socket.js")
var sock = require("socket.io");
var database = require("./server/admin/db.js");
var db = require("./server/admin/admin.js").db;

config.Middleware(app, express);
config.Route(app)
database.postsListener();
app.use(express.static(__dirname + "/dist/"))
app.set('port', process.env.PORT || 6520);

var http = require("http").createServer(app)
var io = require("socket.io")(http)
//get socket io
io.on("connection", function(socket){
    console.log("user connected " +socket)
    socket.on("post-on", function(data){
        database.saveData("users/"+data.uid, socket.id);
        socket.broadcast.emit("online", {uid : data.uid})
    })
    socket.on("disconnect", function(){
        db.ref("users").once("value", function(snapshot){
            snapshot.forEach(function(user){
                if(user.child("realtime").val() === socket.id){
                    database.saveData("users/"+ user.key +"/realtime", null);
                    io.emit("post-off", {id : user.key})
                }
            })
        })
    })
    socket.on("new-post", function(data){
        socket.broadcast.emit("new-post", {post : data.post})
    })
})

http.listen(app.get('port'), function(){
    console.log("we are on " + app.get('port') + " again, GART" )
})
realtime.config(app, require("http"));
console.log("test")
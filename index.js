var express = require("express");
var app = express();

var config = require("./server/config.js");
var database = require("./server/admin/db.js");
var db = require("./server/admin/admin.js").database()

config.Middleware(app, express);
config.Route(app)


app.use(express.static(__dirname + "/dist/"))
app.set('port', process.env.PORT || 6520);

var http = require("http").createServer(app)
var io = require("socket.io")(http)
//get socket io
io.on("connection", function(socket){
    console.log("user connected " +socket);
    socket.on("post-on", function(data){
        database.saveData("users/"+data.uid +"/realtime", socket.id);
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
    socket.on("like", function(data){
        console.log(data.id +"likes")
        db.ref("posts/num").once("value", function(num){
            var number = parseInt(num.val())
            var realId = number - parseInt(data.post_id);
            database.saveData("posts/content/"+ realId +"/likes/"+data.id , true)
            socket.broadcast.emit("like", {
                post_id : realId,
                id : data.id,
                sum : number
            })
        })
        
    })
    socket.on("unlike", function(data){
        console.log(data.id +"unlikes")
        db.ref("posts/num").once("value", function(num){
            var number = parseInt(num.val())
            var realId = number - parseInt(data.post_id)+1;
            database.saveData("posts/content/"+ realId +"/likes/"+data.id , null)
            socket.broadcast.emit("unlike", {
                post_id : realId,
                id : data.id,
                sum : number
            })
        })
    })
})
database.postsListener();
http.listen(app.get('port'), function(){
    console.log("we are on " + app.get('port') + " again, GART" )
})
console.log("test")
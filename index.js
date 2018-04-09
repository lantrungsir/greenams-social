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
    console.log("user connected " + socket);
    socket.on("post-on", function(data){
        database.saveData("users/"+data.uid +"/realtime", socket.id);
        database.getData("users/"+data.uid).then((user)=>{
            var result = {
                "id": "",
                "data":{}
            }
            Object.defineProperty(result,"id", data.uid);
            Object.defineProperty(result, "data",  user);
            Object.defineProperty(result.data, "realtime", "online")
            socket.broadcast.emit("online", result)
        })
       
    })
    socket.on("disconnect", function(){
        db.ref("users").once("value", function(snapshot){
            snapshot.forEach(function(user){
                if(user.child("realtime").val() === socket.id){
                    database.saveData("users/"+ user.key +"/realtime", null);
                    io.emit("offline", {id : user.key})
                }
            })
        })
    })
    socket.on("new-post", function(data){
        socket.broadcast.emit("new-post", {post : data.post})
    })
    socket.on("like", function(data){
        console.log(data.post_id)
        console.log(data.id +"likes")
        db.ref("posts/num").once("value", function(num){
            var number = parseInt(num.val())
            var realId = number - parseInt(data.post_id)+1;
            database.saveData("posts/content/"+ realId +"/likes/"+data.id , true)
            socket.broadcast.emit("like", {
                post_id : realId,
                id : data.id,
                sum : number
            })
        })
        
    })
    socket.on("unlike", function(data){
        console.log(data.post_id)
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
    socket.on("new-comment", function(data){
        console.log(data.post_id);
        db.ref("posts/num").once("value", function(num){
            var number = parseInt(num.val())
            var realId = number - parseInt(data.post_id)+1;
            db.ref("posts/content/"+realId+"/comments/num").once("value", function(val){
                var comment_num = val.val();
                var realCommentId = parseInt(comment_num)+1
                database.saveData("posts/content/"+ realId +"/comments/content/"+ realCommentId, {
                    author : data.data.author_id,
                    message : data.data.message
                })
            })
            db.ref("users/"+data.data.author_id).once("value", function(user){
                var author = user.val()
                socket.broadcast.emit("new-comment", {
                    post_id : realId,
                    sum : number,
                    comment : {
                        author : author,
                        message : data.data.message,
                    } 
                })
            })
        })
    })
})
database.postsListener();
http.listen(app.get('port'), function(){
    console.log("we are on " + app.get('port') + " again, GART" )
})
console.log("test")
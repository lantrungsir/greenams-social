var sock = require("socket.io");
var database = require("../admin/db.js");
var db= require("../admin/admin.js").db
module.exports ={
    config : function(app, http){
        var https = http.createServer(app);
        var io = sock(https);
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
    }
}
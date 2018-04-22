var express = require("express");
var app = express();

var config = require("./server/config.js");
var database = require("./server/admin/db.js");
var db = require("./server/admin/admin.js").database()

const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

const sessionPath = sessionClient.sessionPath("free-schedule", "greenams6520");

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
            Object.defineProperty(result,"id", 
            {
                value: data.uid,
                configurable: true,
                writable: true
            });
            Object.defineProperty(result, "data", {
                value : user,
                configurable: true,
                writable: true
            });
            Object.defineProperty(result.data, "realtime", {
                value : "online",
                configurable: true,
                writable: true
            })
            console.log(result)
            socket.broadcast.emit("online", result)
        })
       
    })
    socket.on("disconnect", function(){
        db.ref("users").once("value", function(snapshot){
            snapshot.forEach(function(user){
                if(user.child("realtime").val() === socket.id){
                    database.saveData("users/"+ user.key +"/realtime", null);
                    console.log(user.key)
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
                socket.broadcast.emit("new-comment", {
                    post_id : realId,
                    sum : number,
                    comment : {
                        author :data.data.author_id,
                        message : data.data.message,
                    } 
                })
        })
    })
    socket.on('new-message', (data)=>{
        socket.broadcast.emit("new-message", {
            type : data.type,
            sender : data.sender,
            recipient: data.recipient,
            message: data.message
        })
        console.log(data);
        if(data.type === "individual"){
            if(data.recipient === "admin"){
                sessionClient.detectIntent({
                    session : sessionPath,
                    queryInput:{
                        text: data.message.text,
                        languageCode :'en-US'
                    }
                })
                .then((response)=>{
                    console.log(response)
                })
                .catch((err)=>{
                    console.log(err)
                })
            }
            else{
                var option1 =  data.recipient + "*" + data.sender
                var option2 = data.sender + "*" +data.recipient
                db.ref("messages/individual/"+ option1).once("value", function(data1){
                    db.ref("messages/individual/"+ option2).once("value", function(data2){
                        if(data1.exists()){
                            db.ref("messages/individual/"+ option1 + "/messages/num").once("value", function(number){
                                var num = parseInt(number.val().toString());
                                database.saveData("messages/individual/"+option1 +"/messages/content/"+ num, {
                                    "author" : data.sender,
                                    "data" :{
                                        "text" : data.message.text
                                    }
                                })
                            })
                        }
                        else {
                            if(data2.exists()){
                                db.ref("messages/individual/"+ option2 + "/messages/num").once("value", function(number){
                                    var num = parseInt(number.val().toString());
                                    database.saveData("messages/individual/"+option2 +"/messages/content/"+ num, {
                                        "author" : data.sender,
                                        "data" :{
                                            "text" : data.message.text
                                        }
                                    })
                                })
                            }
                            else{
                                    database.saveData("messages/individual/"+option1 +"/messages/content/0", {
                                        "author" : data.sender,
                                        "data" :{
                                            "text" : data.message.text
                                        }
                                    })
                                
                            }
                        }
                    })
                })
            }
        }
        else{
           if(data.type === "groups"){
                db.ref("messages/groups/"+data.recipient +"/messages/num").once("value", function(number){
                    if(number.val() === null){
                        database.saveData("messages/groups/"+ data.recipient +"/messages/content/0", {
                            "author" : data.sender,
                            "data" :{
                                "text": data.message.text
                            }
                        })
                    }
                    else{
                        var num = parseInt(number.val())
                        database.saveData("messages/groups/"+ data.recipient +"/messages/content/"+ num, {
                            "author" : data.sender,
                            "data" :{
                                "text": data.message.text
                            }
                        })
                    }
                })
            } 
        }
        
    })
    socket.on("update-message", (data)=>{
        socket.broadcast.emit("update-message", data);
    })
})
database.listener();
http.listen(app.get('port'), function(){
    console.log("we are on " + app.get('port') + " again, GART" )
})
console.log("test")
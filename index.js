var express = require("express");
var app = express();

var config = require("./server/config.js");
var database = require("./server/admin/db.js");
var db = require("./server/admin/admin.js").database()

var msg = require("./server/admin/admin.js").messaging();
const dialogflow = require('dialogflow');

const sessionClient = new dialogflow.SessionsClient({
    keyFilename :"./botty-green-seracckey.json"
});

config.Middleware(app, express);
config.Route(app)


app.use(express.static(__dirname + "/dist/"))
var path = require('path')

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.set('port', process.env.PORT || 6520);

var http = require("http").createServer(app)
var io = require("socket.io")(http)
//get socket io
io.on("connection", function(socket){
    var eventPayload= {
        notification:{
            title :"Reminder",
            body :"",
            icon :"https://blog.socedo.com/wp-content/uploads/2016/09/Events.jpg"
        }
    }
    database.getData("meets").then((events)=>{
        for(key in events){
            if(events.hasOwnProperty(key)){
                var event = events[key];
                var time = new Date(event.day).getTime() - new Date().getTime()
                if(time > 0 && time < 86400000){
                    eventPayload.notification.body = "Tomorrow at "+ event.time.substring(11,16) +", you have an appointment with GreenAms team with content "+event.content+". Please come :)"
                    database.getData("users").then((users)=>{
                        for(userkey in users){
                            if(users.hasOwnProperty(userkey)){
                                if(users[userkey]['fcm-token']!== undefined){
                                    msg.sendToDevice(users[userkey]['fcm-token'], eventPayload)
                                }
                            }
                        }
                    })
                }
                if(time <0){
                    database.saveData("meets/"+key, null);
                }
            }
        }
    })
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
        var payload = {
            notification:{
                title : "New post",
                body : "",
                icon :"",
                click_action :"https://greenams-social.herokuapp.com"
            }
        }
        database.getData("users").then((users)=>{
            for(key in users){
                if(users.hasOwnProperty(key) && key !== data.post.author){
                    payload.notification.icon = users[data.post.author]['profile_pic'];
                    payload.notification.body = users[data.post.author]['name'] + " publish a new post in our group. Check this out !"
                    if(users[key]['fcm-token']!== undefined){
                        msg.sendToDevice(users[key]['fcm-token'], payload)
                    }
                }
            }
        })
        
    })
    socket.on("like", function(data){
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
        var payload = {
            data:{
                post_id : data.post_id.toString()
            },
            notification:{
                title : "New comment",
                body : "",
                icon : "",
                click_action :"https://greenams-social.herokuapp.com"
            }
        }
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
                database.getData("users").then((users)=>{
                    database.getData("posts/content/"+ realId+"/author").then((postAuthor)=>{
                        for(key in users){
                            if(users.hasOwnProperty(key) && key !== data.data.author_id){
                                payload.notification.icon = users[data.data.author_id]['profile_pic'];
                                payload.notification.body =users[data.data.author_id]['name'] + " post new comment in " + users[postAuthor].name + "'s post. Check this out !"
                                if(users[key]['fcm-token']!== undefined){
                                    msg.sendToDevice(users[key]['fcm-token'], payload)
                                }
                            }
                        }
                    })
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
        if(data.type === "individual"){
            if(data.recipient === "admin"){
                var sessionPath = sessionClient.sessionPath("free-schedule", data.sender);
                sessionClient.detectIntent({
                    session : sessionPath,
                    queryInput:{
                        text: {
                            text : data.message.text,
                            languageCode :'en-US'
                        }
                    }
                })
                .then((response)=> {
                    var result = response[0].queryResult;

                    if(result.webhookPayload !== undefined && result.webhookPayload !== null){
                        var images = []
                        var links = []
                        var content = result.webhookPayload['fields']['web']['structValue']['fields']['content']['structValue']['fields']
                        for(var i = 0 ; i< content['images']['listValue']['values'].length ;i++){
                           images.push(content['images']['listValue']['values'][i]['stringValue'])
                        }
                        for(var i = 0 ; i< content['links']['listValue']['values'].length ;i++){
                            links.push(content['links']['listValue']['values'][i]['stringValue'])
                         }
                        io.emit("new-message", {
                            type : data.type,
                            sender : 'admin',
                            recipient: data.sender,
                            message: {
                                text: content['text']['stringValue'],
                                images :images,
                                links : links
                            }
                        })
                    }
                    else{
                       io.emit("new-message", {
                            type : data.type,
                            sender : 'admin',
                            recipient: data.sender,
                            message: {
                                'text' : result.fulfillmentText
                            }
                        })
                    }
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
var db = require("./admin.js").database();
var messaging = require("./admin.js").messaging()
module.exports = {
    saveData: function(path, data){
        db.ref(path).set(data);
    },
    pushData: async function(path, data){
        return new Promise((resolve, reject)=>{
            var newRef = db.ref(path).push();
            newRef.set(data);
            resolve();
        })
    },
    getData: async function(path){
        return new Promise((resolve, reject)=>{
            db.ref(path).once("value", function(snapshot){
                resolve(snapshot.val())
            })
        })
    },
    listener : function(){
        db.ref("posts/num").set(0);
        db.ref("posts/content").on("child_added", function(snapshot, prevKey){
            db.ref("date/posts").once("value", function(date){
                console.log(new Date(date.val()))
                if(new Date().getSeconds() - new Date(date.val()).getSeconds() >= 32000000){
                    
                    db.ref("date/posts").set(new Date().toDateString());
                    db.ref("posts/content").set(null).then(()=>{
                        db.ref("posts/num").set(0).then(()=>{
                            db.ref("posts/content/1").set(snapshot.val());
                        })
                    })
                }
            })
            db.ref("posts/num").once("value", function(snap){
                var value = snap.val() + 1;
                db.ref("posts/num").set(value);
                db.ref("posts/content/"+snapshot.key+"/comments/num").set(0)
            })
            db.ref("posts/content/"+snapshot.key +"/comments/content").on("child_added", (snap,preK)=>{
                db.ref("posts/content/"+snapshot.key+"/comments/num").once("value", function(num){
                    var value = num.val() + 1;
                    db.ref("posts/content/"+snapshot.key+"/comments/num").set(value);
                })
            })
        })
        db.ref("messages").on("child_added", function(category, nextkey){
            db.ref("messages/"+category.key).on("child_added",function(chatroom, nextkey){
                    db.ref("messages/"+ category.key +"/"+chatroom.key +"/messages/num").set(0)
                    db.ref("messages/"+ category.key +"/"+chatroom.key +"/messages/content").on("child_added", function(message, nextkey){
                        db.ref("messages/"+ category.key +"/"+chatroom.key +"/messages/num").once("value", function(num){
                            var value = num.val()+1;
                            db.ref("messages/"+ category.key +"/"+chatroom.key +"/messages/num").set(value)
                        })
                        db.ref("date/messenger").once("value", function(date){
                            if(new Date(date.val()).getSeconds() + 630000 <= new Date().getSeconds()){
                                db.ref("messages/"+ category.key +"/"+chatroom.key +"/messages/content").set(null).then(()=>{
                                    db.ref("messages/"+ category.key +"/"+chatroom.key +"/messages/num").set(0).then(()=>{
                                        db.ref("messages/"+ category.key +"/"+chatroom.key +"/messages/content/0").set(message.val());
                                    })
                                })
                                db.ref("date/messenger").set(new Date().toDateString());
                                
                            }
                        })
                    })
            })
        })
        db.ref("meets").on("child_added", function(event, prevKey){
            var payload = {
                data: event.val(),
                notification :{
                    title : "New event",
                    body :"A new event was created for our team. Click to check",
                    icon :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMoN9H6TfjiJ2nkp4eVaOyH_bU3aMrxOa5C3_1MF7Pk_WLXq1j"
                }
            }
            db.ref("users").once("value", function(users){
                users.forEach(function(user){
                    if(user.child("fcm-token").exists()){
                        messaging.sendToDevice(user.child("fcm-token").val(), payload);
                    }
                })
            })
        })
    }
    
}
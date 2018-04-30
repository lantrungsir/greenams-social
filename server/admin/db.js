var db = require("./admin.js").database();
const self = module.exports = {
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
        db.ref("posts/content").on("child_added", (snapshot, prevKey)=>{
            db.ref("date/posts").once("value", function(date){
                console.log(new Date(date.val()))
                if(new Date().getTime() - new Date(date.val()).getTime() >= 32000000000){
                    db.ref("date/posts").set(new Date().toDateString()).then(()=>{
                        db.ref("posts/content").set(null).then(()=>{
                            db.ref("posts/num").set(0).then(()=>{
                                db.ref("posts/content/1").set(snapshot.val());
                            })
                        })
                    })
                }
                else{
                    db.ref("posts/num").once("value", function(snap){
                        var value = snap.val() + 1;
                        db.ref("posts/num").set(value);
                        db.ref("posts/content/"+snapshot.key+"/comments/num").set(0)
                    }) 
                    db.ref("posts/content/"+snapshot.key +"/comments/content").on("child_added", (snap,preK)=>{
                        db.ref("posts/content/"+snapshot.key+"/comments/num").once("value", function(num){
                            var val = num.val() + 1;
                            db.ref("posts/content/"+snapshot.key+"/comments/num").set(val);
                        })
                    })
                }
            })   
        })
        db.ref("posts/content").on("child_removed", function(snapshot){
            snapshot.child("images").forEach(function(image){
                var imageurl = image.val()
                var imgNames = imageurl.split("/")
                var imgName = imgNames[imgNames.length-1];
                
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
                            if(new Date(date.val()).getTime() + 630000000 <= new Date().getTime()){
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
    }
    
}
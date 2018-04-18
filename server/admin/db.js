var db = require("./admin.js").database();
var st = require("./admin.js").storage().bucket();
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
        st.file('botty-green.jpg').makePublic().then(()=>{});
        db.ref("posts/num").set(0);
        db.ref("posts/content/1").set({
            "author" : "admin",
            "message" :"Welcome to our new social website, GART members. I'm Botty Green, your virtual assistant and the admin of the website. Please feel free to use the service I offer you",
            "time" :  new Date().toLocaleDateString()
        })
        db.ref("posts/content").on("child_added", function(snapshot, prevKey){
            db.ref("posts/content/"+snapshot.key +"/comments/content/1").set({
                "author" : "admin",
                "message" : "Look like you have posted a post. Well done !!_!!"
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
                })
            })
        })
    },
    
}
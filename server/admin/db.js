var db = require("./admin.js").database();
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
        db.ref("messages").once("value", function(categories){
            categories.forEach(function(category){
                category.forEach(function(chatroom){
                    db.ref("messages/"+ category.key +"/"+chatroom.key +"/messages/content").on("child_added", function(message){
                        db.ref("messages/"+ category.key +"/"+chatroom.key +"/messages/num").once("value", function(num){
                            var value = num.val()+1;
                            db.ref("messages/"+ category.key +"/"+chatroom.key +"/messages/num").set(value)
                        })
                    })
                })
            })
        })
    },
    getPost: async function(){
        return new Promise((resolve, reject)=>{
            db.ref("posts/content").once("value", function(snapshot){
                var data = snapshot.val();
                new Promise((agree, disagree)=>{
                    snapshot.forEach(function(post){
                        new Promise((approve, disapprove)=>{
                            db.ref("users/"+ post.child("author").val()).once("value", function(author){
                                approve(author.val())
                            })
                        }).then((authorval)=>{
                            new Promise((rs,rj)=>{
                                data[post.key].author = authorval;
                                post.child("comments/content").forEach(function(comment){
                                    new Promise((agr, disagr)=>{
                                        db.ref("users/"+comment.child("author").val()).once("value", (comment_author)=>{
                                            agr(comment_author.val()) 
                                        })
                                    }).then((commentAuthor)=>{
                                        if(data[post.key].comments["num"]=== 0){
                                            db.ref("posts/content/"+ post.key+ "/comments/num").once("value", function(number){
                                                if(comment.key.toString()=== number.val().toString() || parseInt(number.val()) === 0){
                                                    rs();
                                                }
                                            })
                                        }
                                        else{
                                            data[post.key].comments["content"][comment.key]["author"] = commentAuthor;
                                            console.log(data[post.key].comments["content"][comment.key])
                                            db.ref("posts/content/"+ post.key+ "/comments/num").once("value", function(number){
                                                if(comment.key.toString()=== number.val().toString() || parseInt(number.val()) === 0){
                                                    rs();
                                                }
                                            })
                                        }  
                                    })
                                })
                            }).then(()=>{
                                db.ref("posts/num").once("value", function(number){
                                    if(post.key.toString() === number.val().toString() || number.val()===0){
                                        agree();
                                    }
                                })
                            })
                        })
                    })
                }).then(()=>{
                    resolve(data);
                })
            })
        })
    }
}
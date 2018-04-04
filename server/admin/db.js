var db = require("./admin.js").database();
var io = require("../../index.js").io;
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
    postsListener : function(){
        db.ref("posts/num").set(0)
        db.ref("posts/content").on("child_added", function(snapshot, prevKey){
            db.ref("posts/num").once("value", function(snap){
                var value = snap.val() + 1;
                db.ref("posts/num").set(value);
            })
        })
        db.ref("posts/content").on("child_changed", function(snapshot){
            var data = snapshot.val();
            //update links
            
            var links = [];
            for(key in data.links){
                if(data.links.hasOwnProperty(key)){
                    links.push(data.links[key]);
                }
            }
            Object.defineProperty(data, "links", {
                value : links,
                configurable : true,
                writable : true
            })

            //update images
            var images = [];
            for(key in data.images){
                if(data.images.hasOwnProperty(key)){
                    links.push(data.images[key]);
                }
            }
            Object.defineProperty(data, "images", {
                value : images,
                configurable : true,
                writable : true
            })
            
            io.emit("update-post", {id :snapshot.key, data: data})
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
                            data[post.key].author = authorval;
                            db.ref("posts/num").once("value", function(number){
                                if(post.key.toString() === number.val().toString() || number.val()===0){
                                    agree();
                                }
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
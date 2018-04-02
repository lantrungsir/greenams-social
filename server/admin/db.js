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
    postsListener : function(){
        db.ref("posts/num").set(0)
        db.ref("posts/content").on("child_added", function(snapshot, prevKey){
            db.ref("posts/num").once("value", function(snap){
                var value = snap.val() + 1;
                db.ref("posts/num").set(value);
                db.ref("posts/content/"+ snapshot.key +"/id").set(value);
            })
        })
    },
    getPost: async function(){
        return new Promise((resolve, reject)=>{
            db.ref("posts/content").orderByChild('id').once("value", function(snapshot){
                var data = snapshot.val();
                new Promise((agree, disagree)=>{
                    snapshot.forEach(function(post){
                        new Promise((approve, disapprove)=>{
                            db.ref("users/"+ post.child("author").val()).once("value", function(author){
                                approve(author.val())
                            })
                        }).then((authorval)=>{
                            data[post.key] = authorval;
                            db.ref("posts/num").once("value", function(number){
                                if(post.child("id").val() === number.val()){
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
var db = require("../admin/db.js")
var storage = require("../admin/storage.js")
var database = require("../admin/admin.js").database();
module.exports ={
    getPost: function(req, res){
        db.getPost().then(function(data){
            new Promise((resolve, reject)=>{
                var purifiedPostData = [];
                for(key in data){
                    if(data.hasOwnProperty(key)){
                            var purifiedImageData = []
                            for(imageKey in data[key].images){
                                if(data[key].images.hasOwnProperty(imageKey)){
                                    purifiedImageData.push(data[key].images[imageKey])
                                }
                            }
                           
                            var purifiedLinkData = []
                            for(linkKey in data[key].images){
                                if(data[key].links.hasOwnProperty(linkKey)){
                                    purifiedLinkData.push(data[key].links[linkKey])
                                }
                            }
                            data[key].images =  purifiedImageData;
                            data[key].links =  purifiedLinkData;
                            purifiedPostData.push(data[key]);      
                    }
                }
                resolve(purifiedPostData);
            }).then((posts)=>{
                var superPosts = [];
                for(var i = posts.length-1 ;i > -1 ;i--){
                  superPosts.push(posts[i]);
                }
                console.log(superPosts)
                res.status(200).send(JSON.stringify(superPosts)); 
            })
        })
    },
    setNewPost: function(req, res){
        var newPost = req.body.new_post
        var author = newPost.author.id;
        Object.defineProperty(newPost, "author", {
            value :author,
            configurable: true,
            writable: true
        })
        database.ref("posts/num").once("value", function(snapshot){
            var num = snapshot.val()+1;
            db.saveData("posts/content/"+ num,  newPost);
        })
    },

    //upload files,
    filesUploadHandle: function(req,res){
        var files = req.files;
        var postNum = req.query.post_id;
        //upload to firebase cloud storage
        storage.uploadFiles(postNum, files, res);
    }
}
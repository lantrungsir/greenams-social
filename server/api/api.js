var db = require("../admin/db.js")
var storage = require("../admin/storage.js")
var database = require("../admin/admin.js").database();
module.exports ={
    getPost: function(req, res){
        db.getPost().then(function(data){
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
                            for(linkKey in data[key].links){
                                if(data[key].links.hasOwnProperty(linkKey)){
                                    purifiedLinkData.push(data[key].links[linkKey])
                                }
                            }
                            var purifiedLikes = []
                            for(likeKey in data[key].likes){
                                if(data[key].likes.hasOwnProperty(likeKey)){
                                    purifiedLikes.push(likeKey)
                                }
                            }
                            var purifiedComments= []
                            for(commentKey in data[key].comments["content"]){
                                if(data[key].comments["content"].hasOwnProperty(commentKey)){
                                    console.log(data[key].comments["content"][commentKey])
                                    purifiedComments.slice(0,0, data[key].comments["content"][commentKey]);
                                }
                            }
                            data[key].likes = purifiedLikes
                            data[key].images =  purifiedImageData;
                            data[key].links =  purifiedLinkData;
                            data[key].comments = purifiedComments;
                            purifiedPostData.push(data[key]);      
                    }
                }
                var superPosts = [];
                for(var i = purifiedPostData.length-1 ;i > -1 ;i--){
                  superPosts.push(purifiedPostData[i]);
                }
                console.log(superPosts)
                res.status(200).send(JSON.stringify(superPosts)); 
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
            db.saveData("posts/content/"+ num, newPost)
        })
        res.status(200).send("OKAY")
    },

    //upload files,
    filesUploadHandle: function(req, res){
        var files = req.files;
        var postNum = req.query.post_id;
        //upload to firebase cloud storage
        storage.uploadFiles(postNum, files).then((data)=>{
            console.log(data);
            res.status(200).send(JSON.stringify({
                id: postNum,
                data : data
            }));
        });
    }
}
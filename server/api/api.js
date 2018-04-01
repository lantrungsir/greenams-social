var db = require("../admin/db.js")

module.exports ={
    getPost: function(req, res){
        db.getData("posts").then(function(data){
            //get author :
            new Promise((resolve, reject)=>{
                var purifiedPostData = [];
                for(key in data){
                    if(data.hasOwnProperty(key)){
                        new Promise((resolve, reject)=>{
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
                            resolve(data[key])
                        }).then((post)=>{
                            purifiedPostData.push(post);
                        })
                    }
                }
                resolve(purifiedPostData);
            }).then((posts)=>{
                console.log(posts);
                res.status(200).send(JSON.stringify(posts)); 
            })
        })
    },
    setNewPost: function(req, res){
        var newPost = req.body.new_post
        db.pushData("posts", newPost).then(()=>{
            res.status(200).send("OKAY");
        })
    }
}
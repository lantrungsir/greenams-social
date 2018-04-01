var db = require("../admin/db.js")

module.exports ={
    getPost: function(req, res){
        db.getData("posts").then(function(data){
            //get author : 
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
                    db.getData("users/", data[key].author).then((authorVal)=>{
                        data[key].author = authorVal;
                    })
                    purifiedPostData.push(data[key]);
                }
            }
        res.status(200).send(JSON.stringify(purifiedPostData));    
        })
    },
    setNewPost: function(req,res){
        var newPost = req.body.new_post;
        db.pushData("posts", newPost).then(()=>{
            res.status(200).send("OKAY");
        })
    }
}
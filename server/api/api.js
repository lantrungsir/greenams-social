var db = require("../admin/db.js")
var storage = require("../admin/storage.js")
var database = require("../admin/admin.js").database();
module.exports ={
    getPost: function(req, res){
        db.getData("posts/content").then(function(data){
            console.log(data);
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
                                    purifiedComments.splice(0,0, data[key].comments["content"][commentKey]);
                                }
                            }
                            data[key].likes = purifiedLikes
                            data[key].images =  purifiedImageData;
                            data[key].links =  purifiedLinkData;
                            data[key].comments = purifiedComments;
                            purifiedPostData.splice(0,0, data[key]);      
                    }
                }
                console.log(purifiedPostData)
                res.status(200).send(JSON.stringify(purifiedPostData)); 
            })
    },
    setNewPost: function(req, res){
        var newPost = req.body.new_post
        var author = newPost.author;
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
    },

    //get all users data
    getAllUsers : function(req, res){
        db.getData("users").then((data)=>{
            for(key in data){
                if(data.hasOwnProperty(key)){
                    if(data[key].realtime !== undefined){
                        data[key].realtime = "online"
                    }
                    else{
                        data[key].realtime = "offline"                    
                    }
                }
            }
            console.log(data)
            res.status(200).send(JSON.stringify(data))
        })
    },
    //get indvidual messages :
    getIndividualMessages: function(req,res){
        var from = req.query["from"];
        var to = req.query["to"]
        db.getData("messages/individual").then((data)=>{
            var purifiedData = []
            for(key in data){
                if(data.hasOwnProperty(key)){
                    var keys =  key.split("*");
                    if(keys.indexOf(from)!== -1 && keys.indexOf(to)!==-1){
                        for(subkey in data[key]['messages']['content']){
                            if(data[key].messages['content'].hasOwnProperty(subkey)){
                                
                                var images = [];
                                var links = []
                                for(imageKey in data[key].messages['content'][subkey]['data'].images){
                                    if(data[key].messages['content'][subkey]['data'].images.hasOwnProperty(imageKey)){
                                        images.push(data[key].messages['content'][subkey]['data'].images[imageKey])
                                    }
                                }
                                data[key].messages['content'][subkey]['data'].images = images;
                                for(linkKey in data[key].messages['content'][subkey]['data'].links){
                                    if(data[key].messages['content'][subkey]['data'].links.hasOwnProperty(linkKey)){
                                        links.push(data[key].messages['content'][subkey]['data'].links[linkKey])
                                    }
                                }
                                data[key].messages['content'][subkey]['data'].links = links;
                                purifiedData.push(data[key].messages['content'][subkey]);
                            }
                        }
                    }
                }
            }
            console.log(purifiedData);
            res.status(200).send(JSON.stringify(purifiedData))
        })
    },
    getGroupMessages : function(req,res){
        var id = req.query.id;
        if(id !== undefined){
            db.getData("messages/groups/"+ id).then((data)=>{
                var messages = [];
                if(data['messages']!== undefined){
                    for(key in data['messages']['content']){
                        if(data['messages']['content'].hasOwnProperty(key)){
                            var images = [];
                            var links = []
                            for(imageKey in data.messages['content'][key]['data'].images){
                                if(data.messages['content'][key]['data'].images.hasOwnProperty(imageKey)){
                                    images.push(data.messages['content'][key]['data'].images[imageKey])
                                }
                            }
                            data.messages['content'][key]['data'].images = images;
                            for(linkKey in data.messages['content'][key]['data'].links){
                                if(data.messages['content'][key]['data'].links.hasOwnProperty(linkKey)){
                                    links.push(data.messages['content'][key]['data'].links[linkKey])
                                }
                            }
                            data.messages['content'][key]['data'].links = links;
                            messages.push(data['messages']['content'][key]);

                        }
                    }
                }
                data['messages'] =  messages;
                console.log(data);
                res.status(200).send(JSON.stringify(data))
            })
        }
        else{
            db.getData("messages/groups").then((data)=>{
                for(key in data){
                    if(data.hasOwnProperty(key)){
                        data[key]['messages'] = null;
                    }
                }
                console.log(data);
                res.status(200).send(JSON.stringify(data));
            })
        }
    },
    messengerFileUploadHandle: function(req,res){
        var type= req.query.type;
        var from = req.query['from']
        var to = req.query['to']
        storage.messengerUploadFiles(req.files, type, from, to, req.query['mid']).then((data)=>{
            console.log(data);
            res.status(200).send(JSON.stringify(data));
        });
    },
    getEvent: function(req, res){
        db.getData("meets").then((data)=>{
            var events = []
            for(key in data){
                if(data.hasOwnProperty(key)){
                    events.splice(0,0, data[key]);
                }
            }
            res.status(200).send(JSON.stringify(events));
        })
    },
    saveFCMToken: function(req,res){
        var token = req.body.token;
        var id = req.query.id;
        console.log(token);
        db.saveData("users/"+id+"/fcm-token", token);
        res.send("tks for using fcm");
    }
}

var db = require("../admin/db.js")
var storage = require("../admin/storage.js")
var database = require("../admin/admin.js").database();
var request = require('request');
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
    messengerFileUploadHandle(req,res){
        var type= req.query.type;
        var from = req.query['from']
        var to = req.query['to']
        storage.messengerUploadFiles(req.files, type, from, to, req.query['mid']).then((data)=>{
            console.log(data);
            res.status(200).send(JSON.stringify(data));
        });
    },
    //admin botty green webhook
    resolveWebhook(req,res){
        if(req.body.queryResult.action === "input.asking_for_sunsign"){
            if(req.body.queryResult.allRequiredParamsPresent === true){
                var date = req.body.queryResult.parameters.date;
                var month = parseInt(date.substring(5,7));
                var day = parseInt(date.substring(8,10));
                var output = getZodiacSign(day,month);
                res.send(JSON.stringify({ 
                            'fulfillmentText': output.name,
                            'payload' :{
                                'web' : output
                            }
                        }
                    )
                ); 
            }
        }
    }
}
function getZodiacSign(day, month) {
    var zodiacSigns = {
      capricorn:{
        name :'capricorn',
        image : "https://i.pinimg.com/originals/de/b6/32/deb6323fc1c381318f92570736f47b7c.jpg"
      },
      aquarius:{name:'aquarius', image : "http://prakashastrologer.com/wp-content/uploads/2014/10/Aquarius_icon.png"},
      pisces: {name:'pisces', image:"https://blastmagazine.com/wp-content/uploads/2015/03/pisces.png"},
      aries:{name :'aries', image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz1Uw5Pyk1VeneCiTwToL2BfnnYGxhyrUbGS5HCAbiwRyJFV9w"},
      taurus:{name:'taurus', image:"https://static1.squarespace.com/static/5875f79559cc6853ff4f611b/t/58969ed317bffc479b659e3e/1516867875501/?format=1500w"},
      gemini:{name: 'gemini', image: "https://fthmb.tqn.com/86BIQTVla3xK2q-Zj3mHZZY0bpE=/768x0/filters:no_upscale()/geminitwins-56c382dc5f9b5829f86f6032.jpg"},
      cancer:{name :'cancer', image:"http://wellpark.co.nz/wp-content/uploads/2015/07/Cancer-zodiac-sign.jpg"},
      leo:{name :'leo', image:"http://mythman.com/leoOnFireL.jpg"},
      virgo:{name: 'virgo', image:"https://www.englishclub.com/efl/wp-content/uploads/2011/07/06c-Virgo.png"},
      libra:{name:'libra', image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROrxw68iBQAqyI8ZnsqsrxwJ24IBdSy1WJFy5pGq9n-9NJZN3z"},
      scorpio:{name:'scorpio', image :"http://www.astrology-zodiac-signs.com/images/scorpio.jpg"},
      sagittarius:{name:'sagittarius', image:"http://prakashastrologer.com/wp-content/uploads/2014/10/Sagittarius_icon.png"}
    }
  
    if((month == 1 && day <= 20) || (month == 12 && day >=22)) {
      return zodiacSigns.capricorn;
    } else if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) {
      return zodiacSigns.aquarius;
    } else if((month == 2 && day >= 19) || (month == 3 && day <= 20)) {
      return zodiacSigns.pisces;
    } else if((month == 3 && day >= 21) || (month == 4 && day <= 20)) {
      return zodiacSigns.aries;
    } else if((month == 4 && day >= 21) || (month == 5 && day <= 20)) {
      return zodiacSigns.taurus;
    } else if((month == 5 && day >= 21) || (month == 6 && day <= 20)) {
      return zodiacSigns.gemini;
    } else if((month == 6 && day >= 22) || (month == 7 && day <= 22)) {
      return zodiacSigns.cancer;
    } else if((month == 7 && day >= 23) || (month == 8 && day <= 23)) {
      return zodiacSigns.leo;
    } else if((month == 8 && day >= 24) || (month == 9 && day <= 23)) {
      return zodiacSigns.virgo;
    } else if((month == 9 && day >= 24) || (month == 10 && day <= 23)) {
      return zodiacSigns.libra;
    } else if((month == 10 && day >= 24) || (month == 11 && day <= 22)) {
      return zodiacSigns.scorpio;
    } else if((month == 11 && day >= 23) || (month == 12 && day <= 21)) {
      return zodiacSigns.sagittarius;
    }
}
var bucket = require("./admin.js").storage().bucket();
var db = require("./admin.js").database();
var database = require("./db.js");
module.exports ={
    uploadFiles : function(num, files,res){
        new Promise((agree, disagree)=>{
            for(var i = 0;i< files.length ;i++){
                    var file = bucket.file(files[i].originalname);
                    var stream = file.createWriteStream({
                        metadata:{
                            contentType : files[i].mimetype
                        }
                    })
                    stream.on('error', (err)=>{
                        console.log("err");
                        res.status(404).send("Fail to upload files")
                    })
                    stream.on("finish", ()=>{
                        console.log("GREAT");
                        file.makePublic().then(()=>{
                            new Promise((resolve,reject)=>{
                                db.ref("posts/content").once("value", function(snapshot){
                                    snapshot.forEach(function(post){
                                        if(post.key.toString() === num){
                                            database.pushData("posts/content/"+ post.key +"/files", getPublicUrl(file.name))
                                            resolve();
                                        }
                                    })
                                })
                            })
                            .then(()=>{
                                console.log("success making file public");
                                console.log(getPublicUrl(file.name))
                            })
                            .catch((err)=>{
                                console.log("fail "+err);
                                disagree();
                            })
                        })
                    })
                    stream.end(files[i].buffer);
                }
            }).then(()=>{
                res.status(200).send("good")
            }).catch(()=>{
                res.status(404).send("fail to upload file, please re-upload")
            }) 
    }
}
function getPublicUrl (filename) {
    return `https://storage.googleapis.com/`+bucket.name+'/'+ filename;
  }
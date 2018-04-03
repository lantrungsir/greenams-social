var bucket = require("./admin.js").storage().bucket();
var db = require("./admin.js").database();
var database = require("./db.js");
module.exports ={
    uploadFiles : function(num, files,res){
        var bucketFile =new Array(files.length)
        new Promise((agree, disagree)=>{
            for(var i = 0;i < files.length ;i++){
                    bucketFile[i] = bucket.file(files[i].originalname);
                    var stream = bucketFile[i].createWriteStream({
                        metadata:{
                            contentType : files[i].mimetype
                        }
                    })
                    stream.on('error', (err)=>{
                        console.log("err");
                        res.status(404).send("Fail to upload files")
                    })
                    stream.on("finish", ()=>{
                        
                    })
                    stream.end(files[i].buffer);
                    console.log("GREAT");
                        console.log(bucketFile[i].name)
                        bucketFile[i].makePublic().then((response)=>{
                            console.log(response)
                            new Promise((resolve,reject)=>{
                                db.ref("posts/content").once("value", function(snapshot){
                                    snapshot.forEach(function(post){
                                        if(post.key.toString() === num.toString()){
                                            database.pushData("posts/content/"+ post.key +"/files", getPublicUrl(bucketFile[i].name))
                                            resolve();
                                        }
                                    })
                                })
                            })
                            .then(()=>{
                                console.log("success making file public");
                                if(i === files.length-1){
                                    agree();
                                }
                            })
                            .catch((err)=>{
                                console.log("fail "+err);
                                disagree();
                            })
                        })
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
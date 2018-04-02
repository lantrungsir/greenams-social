var bucket = require("./admin.js").storage().bucket();
var db = require("./admin.js").database();
module.exports ={
    uploadFiles : function(num, files,res){
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
                                    if(post.child('id').val() === num){
                                        db.ref("posts/content/"+post.key+"/files").push().set(getPublicUrl(files[i].originalname))
                                        .then(()=>{
                                            resolve();
                                        })
                                    }
                                })
                            })
                        }).then(()=>{
                            console.log("success making file public");
                        })
                    })
                })
                stream.end(files[i].buffer);
            }
            res.status(200).send("good")
    }
}
function getPublicUrl (filename) {
    return `https://storage.googleapis.com/`+bucket.name+'/'+ filename;
  }
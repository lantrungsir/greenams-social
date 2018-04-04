var bucket = require("./admin.js").storage().bucket();
var db = require("./db.js");
module.exports ={
    uploadFiles : function(num, files, res){
            for(var i = 0;i < files.length ;i++){
                new Promise((resolve,reject)=>{
                    var j =i;
                    var file = bucket.file(files[i].originalname);
                    var stream = file.createWriteStream({
                        metadata:{
                            contentType : files[i].mimetype
                        }
                    })
                    stream.on('error', (err)=>{
                        console.log(err);
                        res.status(404).send("Fail to upload files")
                    })
                    stream.on("finish", ()=>{
                        console.log("GREAT");
                        console.log(file.name)
                        var ext = getExtension(file.name)
                        if(ext === "png" || ext === "jpg"|| ext === "bmp" || ext === "gif"){
                            db.pushData("posts/content/"+num+"/images", getPublicUrl(file.name))
                        }
                        db.pushData("posts/content/"+num+"/links", getPublicUrl(file.name))
                        resolve(j);
                    })
                    stream.end(files[i].buffer);
                }).then((j)=>{
                    if(j === files.length-1){
                        res.status(200).send("good");
                    }
                })
            }
    }
}
function getPublicUrl (filename) {
    return `https://storage.googleapis.com/`+bucket.name+'/'+ filename;
}
function getExtension(filename){
    var sep = filename.split(".");
    return sep[sep.length-1];
}
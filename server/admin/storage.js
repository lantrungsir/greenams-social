var bucket = require("./admin.js").storage().bucket();
var db = require("./db.js");
module.exports = {
    uploadFiles : async function(num, files){
        return new Promise((agree, disagree)=>{
            var result = {
                images :[],
                links :[]
            }
            for(var i = 0;i < files.length ;i++){
                new Promise((resolve,reject)=>{
                    var j = i;
                    var file = bucket.file(files[i].originalname);
                    var ext = getExtension(file.name)
                    if(ext === "png" || ext === "jpg"|| ext === "bmp" || ext === "gif"){
                        result.images.push(getPublicUrl(file.name))
                        console.log("good image")
                    }
                    else{
                        result.links.push(getPublicUrl(file.name))
                        console.log("good link")
                    }
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
                        file.makePublic().then(()=>{
                            if(ext === "png" || ext === "jpg"|| ext === "bmp" || ext === "gif"){
                                console.log("good image")
                                db.pushData("posts/content/"+num+"/images", getPublicUrl(file.name))
                            }
                            else{
                                console.log("good link")
                                db.pushData("posts/content/"+num+"/links", getPublicUrl(file.name))
                            }
                            resolve(j);
                        })
                    })
                    stream.end(files[i].buffer);
                }).then((j)=>{
                    if(j.toString() === (files.length-1).toString()){
                        agree(result)
                    }
                    else{
                        
                    }
                })
            }
        })
    }
}
function getPublicUrl (filename) {
    return `https://storage.googleapis.com/`+bucket.name+'/'+ filename;
}
function getExtension(filename){
    var sep = filename.split(".");
    return sep[sep.length-1];
}
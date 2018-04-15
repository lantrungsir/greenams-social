var bucket = require("./admin.js").storage().bucket();
var db = require("./db.js");
var database = require("./admin.js").database()
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
    },
    messengerUploadFiles(files, type, from, to, id){
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
                        var filename = getPublicUrl(file.name)
                        file.makePublic().then(()=>{
                            if(ext === "png" || ext === "jpg"|| ext === "bmp" || ext === "gif"){
                                console.log("good image")
                                if(type === "individual"){
                                    var option1 = from +"*"+to;
                                    var option2 = to +"*"+ from;
                                    database.ref("messages/individual/"+ option1).once("value", function(data1){
                                        database.ref("messages/individual/"+ option2).once("value", function(data2){
                                            if(data1.exists()){
                                                    db.pushData("messages/individual/"+option1 +"/messages/content/"+id +"/data/images",
                                                    filename
                                                   )
                                            }
                                            else {
                                                if(data2.exists()){
                                                    db.pushData("messages/individual/"+option2 +"/messages/content/"+id +"/data/images",
                                                    filename
                                                   )
                                                }
                                                else{
                                                    db.pushData("messages/individual/"+option1 +"/messages/content/"+id +"/data/images",
                                                    filename
                                                   )
                                                }
                                            }
                                        })
                                    })
                                }
                                
                            }
                            else{
                                console.log("good link");
                                if(type === "individual"){
                                    var option1 = from +"*"+to;
                                    var option2 = to +"*"+ from;
                                    database.ref("messages/individual/"+ option1).once("value", function(data1){
                                        database.ref("messages/individual/"+ option2).once("value", function(data2){
                                            if(data1.exists()){
                                                    db.pushData("messages/individual/"+option1 +"/messages/content/"+id +"/data/links",
                                                    filename
                                                   )
                                            }
                                            else {
                                                if(data2.exists()){
                                                    db.pushData("messages/individual/"+option2 +"/messages/content/"+id +"/data/links",
                                                    filename
                                                   )
                                                }
                                                else{
                                                    db.pushData("messages/individual/"+option1 +"/messages/content/"+id +"/data/links",
                                                    filename
                                                   )
                                                }
                                            }
                                        })
                                    })
                                }
                                else{
                                    db.pushData("messages/groups/"+ to + "/messages/content/"+ id +"/data/links", filename);
                                }
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
var bucket = require("./admin.js").storage().bucket();
module.exports ={
    uploadFiles : function(files,res){
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
                    console.log("success making file public");
                    res.status(200).send("good");
                })
            })
            stream.end(files[i].buffer);
        }
    }
}
var bucket = require("./admin.js").storage().bucket();
module.exports ={
    uploadFiles : function(files,res){
        for(var i = 0;i< files.length ;i++){
            var file = files[i];
            bucket.upload(file)
                .then(function(){
                    console.log(file);
                    console.log(bucket.name);
                    res.status(200).send("Okay")
                })
        }
    }
}
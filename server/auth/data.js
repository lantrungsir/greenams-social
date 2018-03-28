var db = require("../admin/admin.js").db
module.exports ={
    saveUserAfterLogin: function(path, data){
        db.ref("users/"+ path).set(data);
    },
    queryUser: function(id){
        db.ref("users/"+ id).once("value", function(data){
            return user;
        })
    }
}
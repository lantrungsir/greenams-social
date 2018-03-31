var db = require("./admin.js").database();

module.exports = {
    saveData: function(path, data){
        db.ref(path).set(data);
    },
    pushData: function(path, data){
        var newRef = db.ref(data).push();
        newRef.set(data);
    },
    getData: async function(path){
        return new Promise((resolve, reject)=>{
            db.ref(path).once("value", function(snapshot){
                resolve(snapshot.val())
            })
        })
    }
}
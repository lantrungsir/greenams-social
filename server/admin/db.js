var db = require("./admin.js").database();

module.exports = {
    saveData: function(path, data){
        db.ref(path).set(data);
    },
    pushData: function(path, data){
        var newRef = db.ref(data).push();
        newRef.set(data);
    },
    getData: function(path, keys){
        return Promise((resolve, reject)=>{
            var result ={};
            db.ref(path).once("value", function(snapshot){
                snapshot.forEach(function(data){
                    for(var i = 0 ;i < keys.length; i++){
                        if(data.key === keys[i]){
                            Object.defineProperty(result, data.key, {
                                value : data.val(),
                                writable: true,
                                configurable: true
                            })
                        }
                    }
                })
                resolve(result);
                if(result !== {}){
                    reject();
                }
            })
        })
    }
}
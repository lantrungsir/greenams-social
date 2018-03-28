var admin = require("firebase-admin");
module.exports= {
    db : admin.database(),
    verify : function(){
        var serviceAccount = require("../../serviceAccount.json");
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://free-schedule.firebaseio.com"
        });
    }
}
var admin = require("firebase-admin");
var serviceAccount = require("../../serviceAccount.json")
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://free-schedule.firebaseio.com"
});
module.exports= {
    db : admin.database(),
}
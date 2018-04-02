var admin = require("firebase-admin");

var serAcc = require("../../serAccKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serAcc),
    databaseURL: "https://free-schedule.firebaseio.com",
    storageBucket: "free-schedule.appspot.com"
  });

module.exports = admin;
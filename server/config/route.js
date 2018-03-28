var FBResolve = require("../auth/fb-stragety.js");
var tokenResolver = require("../auth/token-resolve.js")
module.exports = function(app){
    app.post("auth", FBResolve.firstStepLogin,FBResolve.middleStepLogin, tokenResolver.generateToken, tokenResolver.sendToken)
    app.get("auth/me", tokenResolver.verifyRequest, FBResolve.getUserData)
}
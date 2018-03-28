var jwt = require('jsonwebtoken');
const secret = "greenams6520"

module.exports = {
    generateToken : function(req,res, next){
        req.token = createToken(req.auth);
        next()
    },
    sendToken: function(req, res, next){
        res.setHeader("x-auth-token", req.token);
        res.status(200).send(req.auth);
    },
    verifyRequest : function(req,res,next){
        var token = req.headers["x-auth-token"]
        if(token === null){
            res.status(401).send("Unauthorized request");
        }
        else{
            jwt.verify(token, secret, function(err, auth){
                if(err){
                    console.log(err);
                    res.status(401).send("Invalid Token")
                }
                else{
                    console.log(auth.id);
                    next();
                }
            })
        }
    }
}
var createToken = function(auth) {
    return jwt.sign({
      id: auth.id
    }, secret,
    {
      expiresIn: 86400
    });
};
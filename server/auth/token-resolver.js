var jwt = require("jsonwebtoken")
const secret = "greenams6520"
function createToken(auth){
    return jwt.sign({
        id: auth.id
    }, secret,{
        expiresIn: 86400
    })
}

module.exports = {
    generateToken : function(req, res, next){
        req.token = createToken(req.auth);
        next();
    },
    sendToken: function(req,res){
        res.setHeader('x-auth-token', req.token);
        console.log("login successful")
        res.status(200).send(req.auth);
    },
    authenticateRequest: function(req, res, next){
        var token = req.headers["x-auth-token"]
        if(token){
            jwt.verify(token, secret, function(err, auth){
                if(err){
                    res.status(401).send("Unauthorized token");
                }
                else{
                    if(auth){
                        next();
                    }
                }
            })
        }
        else{
            res.status(200).send("OKAY");
        }
    }
}
var request = require("request");
var db = require("./data.js")
module.exports = {
    firstStepLogin : function(req, res, next){
        var token = req.body.user_token;
        request({
            uri :"https://graph.facebook.com/me?fields=name,picture.type(normal)&redirect=false",
            qs:{
                access_token : token
            },
            method :"GET",
            json: true
        }, function(error, response, body){
            if(error){
                console.log(error);
                return;
            }
            else{
                if(response.error){
                    console.log(response.error);
                    return
                }
                else{
                    console.log(body);
                    //save in database
                    var user = {
                        "id" : body.id
                    }
                    user.data = {
                        "profile_pic" : body.picture.data.url,
                        "name" : body.name
                    }
                    
                    db.saveUserAfterLogin(user.id, user.data)
                    req.auth = {
                        id: body.id
                    };
                   
                }
            }
            next();
        })
    },
    middleStepLogin: function(req,res, next){
        if(!req.auth){
            res.status(403).send("User not authenticated");
        }
        else{
            next();
        }
    },

    getUserData: function(req,res,next){
        var id = req.body.id;
        var data = db.queryUser(id)
        res.status(200).send(data)
    }
}
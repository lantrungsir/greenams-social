var db = require("../admin/db.js")
var request = require("request")
module.exports = {
    firstStepLogin : function(req, res, next){
        var token = req.body.user_token;
        request({
            uri :"https://graph.facebook.com/me?fields=name,picture.type(normal)",
            qs:{
                access_token: token
            },
            method : "POST",
            json: true
        }, function(err, response, body){
            if(err){
                console.log(err);
                req.err = err;
                next()
            }
            else{
                if(response.error){
                    console.log(response.error);
                    req.err = response.error;
                    next();
                }
                else{
                    var user = {
                        "profile_pic" : "",
                        "name": ""
                    }
                    user["profile_pic"] = body.picture.data.url;
                    user["name"] = body.name;
                    db.saveData("users/"+ body.id, user);
                    req.user = body.id;
                    next()
                }
            }
        })
    },
    secondStepLogin: function(req, res, next){
        if((!req.user) && req.err){
            res.status(401).send("User not authenticated");
        }
        else{
            req.auth = {
                id : req.user
            }
            next()
        }
    },
    
    getUserFromDatabase: function(req, res){
        var id = req.query.id;
        db.getData("users/"+id).then((user)=>{
            console.log(user)
            res.status(200).send(JSON.stringify(user));
        })
        .catch(()=>{
            res.status(401).send("Not funny");
        })
        
    }
}


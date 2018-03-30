//middleware
var bodyParser = require("body-parser")
var cors =  require("cors")

//route func
var FBStragety = require("./auth/fb-stragety.js");
var TokenManagement = require("./auth/token-resolver.js");
module.exports = {
    Middleware : function(app, express){
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({extended: true}))
        var corsOption = {
            origin: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
            exposedHeaders: ['x-auth-token']
        };
        app.use(cors(corsOption));
    },
    Route : function(app){
        app.post("auth/facebook", FBStragety.firstStepLogin, FBStragety.secondStepLogin, TokenManagement.generateToken, TokenManagement.sendToken)
        app.get("auth/me", TokenManagement.authenticateRequest, FBStragety.getUserFromDatabase);
    }
}
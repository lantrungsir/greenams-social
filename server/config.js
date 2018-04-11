import { ActionSequence } from "selenium-webdriver";

//middleware
var bodyParser = require("body-parser")
var cors =  require("cors")
var multer = require("multer")
//route func
var FBStragety = require("./auth/fb-stragety.js");
var TokenManagement = require("./auth/token-resolver.js");
var ApiResolve = require("./api/api.js")
module.exports = {
    Middleware : function(app, express){
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({extended: true}))
        app.disable('etag');
        var corsOption = {
            origin: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
            exposedHeaders: ['x-auth-token']
        };
        app.use(cors(corsOption));
    },
    Route : function(app){
        app.post("/auth/facebook", FBStragety.firstStepLogin, FBStragety.secondStepLogin, TokenManagement.generateToken, TokenManagement.sendToken)
        app.get("/auth/me", TokenManagement.authenticateRequest, FBStragety.getUserFromDatabase);
        app.route("/api/posts")
            .get(TokenManagement.authenticateRequest, ApiResolve.getPost)
            .post(TokenManagement.authenticateRequest, ApiResolve.setNewPost)
        app.post("/api/upload", multer({
            storage : multer.memoryStorage()
        }).array("uploads"), TokenManagement.authenticateRequest, ApiResolve.filesUploadHandle)
        app.get("/api/users", TokenManagement.authenticateRequest, ApiResolve.getAllUsers)
        app.get("/api/messages/individual", TokenManagement.authenticateRequest, ApiResolve.getIndividualMessages);
        app.get("/api/messages/groups", TokenManagement.authenticateRequest, ApiResolve.getGroupMessages)
    } 
}
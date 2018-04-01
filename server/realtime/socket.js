
module.exports ={
    config : function(app, http){
        var https = http.createServer(app);
        var io = sock(https);
        
    }
}
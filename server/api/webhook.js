var request = require('request');
var db = require("../admin/db.js")

module.exports ={
    resolveWebhook(req,res){
        if(req.body.queryResult.action === "input.asking_for_sunsign"){
            if(req.body.queryResult.allRequiredParamsPresent === true){
                var date = req.body.queryResult.parameters.date;
                var month = parseInt(date.substring(5,7));
                var day = parseInt(date.substring(8,10));
                var output = getZodiacSign(day,month);
                res.send(JSON.stringify({ 
                            'payload' :{
                                'web' : {
                                    'content' :{
                                        'text' : output.name,
                                        'images' : [output.image],
                                        'links' :[]
                                    }
                                }
                            }
                        }
                    )
                ); 
            }
        }
        if(req.body.queryResult.action === "input.asking_for_horoscope"){
            if(req.body.queryResult.allRequiredParamsPresent === true){
                var date = req.body.queryResult.parameters.date;
                var sign = req.body.queryResult.parameters.sunsign.toLowerCase();
                var querydate = "";
                var today = new Date()
                var tomorrow = new Date(new Date().getTime()+ 86400000);
                if(new Date(date).toDateString() === today.toDateString()){
                    querydate = "today"
                } 
                if(new Date(date).toDateString() === tomorrow.toDateString()){
                    querydate = "tomorrow"
                }
                    console.log(querydate);
                    request({
                        uri:"http://theastrologer-api.herokuapp.com/api/horoscope/"+sign+"/"+querydate,
                        method : "GET",
                        json:true
                    },(err,response,body)=>{
                        console.log(err);
                        if(response.body.error) {
                            console.log(response.body.error)
                            res.send(JSON.stringify({ 'fulfillmentText': response.body.error}));  
                        }
                        else{
                            var data = body;
                            console.log(data);
                            var output = "you're " + data.meta.keywords+ ' ' + querydate +". Also there is something you must note here:\n " +data.horoscope+ "\n"+ data.meta.mood+ " mood today. G'day mate :)";
                            res.send(JSON.stringify({
                                'payload':{
                                    'web': {
                                        'content' : {
                                            'text' : output,
                                            'images' : [],
                                            "links" :[]
                                        }
                                    }
                                }
                            }));  
                        }
                    });
            }
        }
        if(req.body.queryResult.action === "input.event_create"){
            if(req.body.queryResult.allRequiredParamsPresent === true){
                db.pushData("meets", {
                    "content" :  req.body.queryResult.parameters.any,
                    "time" : req.body.queryResult.parameters.time,
                    "day": req.body.queryResult.parameters.date,
                 }, true).then(()=>{
                    res.send('nothing');
                 })
            }
        }
    }
}

function getZodiacSign(day, month) {
    var zodiacSigns = {
      capricorn:{
        name :'capricorn',
        image : "https://i.pinimg.com/originals/de/b6/32/deb6323fc1c381318f92570736f47b7c.jpg"
      },
      aquarius:{name:'aquarius', image : "http://prakashastrologer.com/wp-content/uploads/2014/10/Aquarius_icon.png"},
      pisces: {name:'pisces', image:"https://blastmagazine.com/wp-content/uploads/2015/03/pisces.png"},
      aries:{name :'aries', image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz1Uw5Pyk1VeneCiTwToL2BfnnYGxhyrUbGS5HCAbiwRyJFV9w"},
      taurus:{name:'taurus', image:"https://static1.squarespace.com/static/5875f79559cc6853ff4f611b/t/58969ed317bffc479b659e3e/1516867875501/?format=1500w"},
      gemini:{name: 'gemini', image: "https://fthmb.tqn.com/86BIQTVla3xK2q-Zj3mHZZY0bpE=/768x0/filters:no_upscale()/geminitwins-56c382dc5f9b5829f86f6032.jpg"},
      cancer:{name :'cancer', image:"http://wellpark.co.nz/wp-content/uploads/2015/07/Cancer-zodiac-sign.jpg"},
      leo:{name :'leo', image:"http://mythman.com/leoOnFireL.jpg"},
      virgo:{name: 'virgo', image:"https://www.englishclub.com/efl/wp-content/uploads/2011/07/06c-Virgo.png"},
      libra:{name:'libra', image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROrxw68iBQAqyI8ZnsqsrxwJ24IBdSy1WJFy5pGq9n-9NJZN3z"},
      scorpio:{name:'scorpio', image :"http://www.astrology-zodiac-signs.com/images/scorpio.jpg"},
      sagittarius:{name:'sagittarius', image:"http://prakashastrologer.com/wp-content/uploads/2014/10/Sagittarius_icon.png"}
    }
  
    if((month == 1 && day <= 20) || (month == 12 && day >=22)) {
      return zodiacSigns.capricorn;
    } else if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) {
      return zodiacSigns.aquarius;
    } else if((month == 2 && day >= 19) || (month == 3 && day <= 20)) {
      return zodiacSigns.pisces;
    } else if((month == 3 && day >= 21) || (month == 4 && day <= 20)) {
      return zodiacSigns.aries;
    } else if((month == 4 && day >= 21) || (month == 5 && day <= 20)) {
      return zodiacSigns.taurus;
    } else if((month == 5 && day >= 21) || (month == 6 && day <= 20)) {
      return zodiacSigns.gemini;
    } else if((month == 6 && day >= 22) || (month == 7 && day <= 22)) {
      return zodiacSigns.cancer;
    } else if((month == 7 && day >= 23) || (month == 8 && day <= 23)) {
      return zodiacSigns.leo;
    } else if((month == 8 && day >= 24) || (month == 9 && day <= 23)) {
      return zodiacSigns.virgo;
    } else if((month == 9 && day >= 24) || (month == 10 && day <= 23)) {
      return zodiacSigns.libra;
    } else if((month == 10 && day >= 24) || (month == 11 && day <= 22)) {
      return zodiacSigns.scorpio;
    } else if((month == 11 && day >= 23) || (month == 12 && day <= 21)) {
      return zodiacSigns.sagittarius;
    }
}
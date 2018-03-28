var mApp = angular.module("greenams",[
    "ngRoute"
]);

mApp.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    $routeProvider
        .when("/login",{
            templateUrl :"login/login.html",
            controller :"LoginController"
        })
        .when("/intro",{
            templateUrl: "intro/intro.html",
            controller : "IntroController"
        })
        
}]);

mApp.factory("facebook", ["$http","$location","$window", function($http, $location, $window){
    //declare useful function
    checkLoginStatus = function(){
        FB.getLoginStatus(function(response){
            if(response.status === "connected"){
                $http({
                    method :"POST",
                    url :"/auth",
                    headers :{
                        "Content-Type" :"application/json"
                    },
                    data :{
                        user_token: response.authResponse.accessToken,
                    }
                })
                .then((res)=>{
                    if(res.status === 401){
                        if($window.localStorage.getItem('x-auth-token')!== null){
                            $window.localStorage.removeItem('x-auth-token')
                        }
                        $location.path("/login");
                    }
                    else{
                        var token = res.headers(["x-auth-token"]);
                        console.log("token");
                        $window.localStorage.setItem('x-auth-token', token);
                        $location.path("/intro")
                    }
                })
            }
        })
        
    }
    return {
        checkLoginStatus : checkLoginStatus
    }
}]);

mApp.run(["$rootScope", "$window","$location", function($rootScope, $window, $location){
    $window.fbAsyncInit = function(){
            FB.init({ 
              appId: '790223617837082',
              status: true, 
              cookie: true, 
              xfbml: true,
              version: 'v2.12'
            });
    }
    (function(d){
        // load the Facebook javascript SDK
    
        var js,
        id = 'facebook-jssdk',
        ref = d.getElementsByTagName('script')[0];
    
        if (d.getElementById(id)) {
          return;
        }
    
        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
    
        ref.parentNode.insertBefore(js, ref);
    
      }(document));
}]);
//controller
mApp.controller("Login Controller", ["$scope", "facebook", function($scope, facebook){
    $scope.FBLogin = facebook.checkLoginStatus()
}])


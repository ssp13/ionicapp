// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'





var app = angular.module('starter', ['ionic']);

app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});


app.controller('MainCtrl', function($scope, Pusher, $http,$q) {
     
       if(navigator.geolocation){
    navigator.geolocation.watchPosition(function(position){        $scope.$apply(function(){
           $scope.position2=position;
           $http.post('/api/coordinates',position);
       })
   })
}
    //promises style
    function getPosition(){
        var deferred=$q.defer();
            if(navigator.geolocation){
                 navigator.geolocation.watchPosition(function(position){
                    deferred.resolve(position);
                })
            }    
        return deferred.promise;
        }
   
    $scope.getDistance=function getDistance(lat1,lon1,lat2,lon2){
	        
        var R = 6371; // Radius of the earth in km
 	var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
 	var dLon = (lon2-lon1).toRad(); 
 	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  	var d = R * c; // Distance in km
 	return d;
    };
 	/** Converts numeric degrees to radians */
        if (typeof(Number.prototype.toRad) === "undefined") {
            Number.prototype.toRad = function() {
            return this * Math.PI / 180;
            }
        };
            
    var homePos=function(position){
        this.lat=position.coords.latitude;
        this.lon=position.coords.longitude;
        this.accuracy=position.coords.accuracy;
    };
    
    var Pos=function(position){
        this.lat=position.coords.latitude;
        this.lon=position.coords.longitude;
        this.accuracy=position.coords.accuracy;
    };
    
    $scope.home=new homePos({coords:{latitude:37.8653,longitude:23.7574489}});
    var promise=getPosition();
    
    promise.then(function(position){
        
        $scope.position=new Pos(position);
        $scope.distance=$scope.getDistance($scope.position.lat,$scope.position.lon,Number($scope.home.lat),$scope.home.lon);
        $scope.w();
        $http.post('http://ec2-54-72-56-70.eu-west-1.compute.amazonaws.com:5000/api/coordinates',position);
    },function(error){
       $scope.error="error location";
    });
    
    $scope.w=function(){
        $scope.$watch(function(){
        return $scope.home.lat;
        },function(newValue){
            if(newValue){
             $scope.distance=$scope.getDistance($scope.position.lat,$scope.position.lon,Number($scope.home.lat),$scope.home.lon);
             
        }
        }); 
    };      
     
    //$scope.custom = $scope.custom === false ? true: false;
    $scope.geoEnabled=false;
    //can be written as this:
    $scope.toggleGeo=function(){
        $scope.geoEnabled=!$scope.geoEnabled;
        if($scope.geoEnabled){
            if($scope.distance<1)$scope.model.pwr("on");
             if($scope.distance>2)$scope.model.pwr("off");
        }else $scope.model.pwr("off");
    };
    //$scope.custom = ! $scope.custom;
   

    
    $scope.name = 'World';
    $scope.fanspeeds = {
        low: "low",
        medium: "medium",
        high: "high"
    };

    $scope.model = {
        powerMode: '',
        temp: '',
        stemp: '25',
        select: '',
        radio: '',
        pwr:function(state) {
            this.powerMode = state;
            if (state === "on") {
                $http.get('http://fathomless-sands-8466.herokuapp.com/api/get/on');
            }
            else if (state === "off") {
                $http.get('http://fathomless-sands-8466.herokuapp.com/api/get/off');
            }
        },
        tempPlus:function() {
            this.stemp++;
        },
        tempMinus:function() {
            this.stemp--;
        }
    };


    //TODO subscribe to presence channel to see if arduino is subscribed

    Pusher.subscribe("test_channel", "my_event", function(data) {
        $scope.model.temp = data.temp;
       
        console.log(data);

    });
    $scope.$on('test_channel:my_event', function(event, notification) {
        console.log('event notification', notification);

    })

    $scope.$on('$destroy', function() {
        Pusher.unsubscribe('items');
        console.log('Unsubscribed from items');
        Pusher.unsubscribe('activities');
        console.log('Unsubscribed from activities');
    });

    $scope.state = Pusher.state(function(states) {
        console.log(states);
        $scope.st = states;

    });

});

app.directive('flash', function() {
    return{
        restrict: 'A',
        link: function(scope, elem, attrs) {
            scope.$watch(function() {
                return scope.model.temp;
            }, function(newValue, oldValue) {
                console.log(newValue);
                $(elem).delay(200).fadeOut('slow').delay(50).fadeIn('slow');
            });
        }
    };
});


app.provider('PusherService', function() {
    var scriptUrl = 'http://js.pusher.com/2.2/pusher.min.js';
    var scriptId = 'pusher-sdk';
    var apiKey = '';
    var initOptions = {};

    this.setPusherUrl = function(url) {
        if (url)
            scriptUrl = url;
        return this;
    };

    this.setOptions = function(options) {
        initOptions = options || initOptions;
        return this;
    };

    this.setToken = function(token) {
        apiKey = token || apiKey;
        return this;
    };

    // load the pusher api script async
    function createScript($document, callback, success) {
        var tag = $document.createElement('script');
        tag.type = 'text/javascript';
        tag.async = true;
        tag.id = scriptId;
        tag.src = scriptUrl;

        tag.onreadystatechange = tag.onload = function() {
            var state = tag.readState;
            if (!callback.done && (!state || /loaded|complete/.test(state))) {
                callback.done = true;
                callback();
            }
        };

        $document.getElementsByTagName('head')[0].appendChild(tag);
    }

    this.$get = ['$document', '$timeout', '$q', '$rootScope', '$window', '$location',
        function($document, $timeout, $q, $rootScope, $window, $location) {
            var deferred = $q.defer();
            var pusher;

            function onSuccess() {
                pusher = new $window.Pusher(apiKey, initOptions);
            }

            var onScriptLoad = function(callback) {
                onSuccess();
                $timeout(function() {
                    deferred.resolve(pusher);
                });
            };

            createScript($document[0], onScriptLoad);
            return deferred.promise;
        }];

})
.factory('Pusher', ['$rootScope', 'PusherService',
    function($rootScope, PusherService) {
        
         return {
            state: function(callback) {
                PusherService.then(function(pusher) {
                    pusher.connection.bind('state_change', function(states) {
                     console.log(states);
                     if (callback)
                        callback(states);
                        console.log(pusher.connection.state);
                        $rootScope.$broadcast(states);
                        $rootScope.$digest();
                    });

                });
            },
            subscribe: function(channelName, eventName, callback) {
                PusherService.then(function(pusher) {
                    var channel = pusher.channel(channelName) || pusher.subscribe(channelName);
                    channel.bind(eventName, function(data) {
                        if (callback)
                         callback(data);
                         $rootScope.$broadcast(channelName + ':' + eventName, data);
                         $rootScope.$digest();
                    });
                 });
            },
            unsubscribe: function(channelName) {
                PusherService.then(function(pusher) {
                    pusher.unsubscribe(channelName);
                });
            }
         };
    }
]);
app.config(function(PusherServiceProvider) {
        PusherServiceProvider
            .setToken('599a9eb32ff37b5469f7');
    //.setOptions({authEndpoint: "http://localhost/ffs/pusher_auth.php"});
});

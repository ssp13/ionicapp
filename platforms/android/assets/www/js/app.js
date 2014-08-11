// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app=angular.module('starter', ['ionic']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
app.controller('TestCtrl', function($scope){
    $scope.go = function(){
        console.log($scope.test);
        console.log($scope.obj.test);
    };
    $scope.obj = {};
}); 
app.controller('MainCtrl', function($scope,Pusher,$http) {

        
$scope.dosomething=function(){
    
    
};



    $scope.name = 'World';
    $scope.fanspeeds={
        low:"low",
        medium:"medium",
        high:"high"
    };



    $scope.model={
        powerMode:'',
        temp:'',
        stemp:'25',
        select:'',
        radio:'',
        pwr:function(state){
           
            this.powerMode=state;
			if(state==="on"){
        $http.get('http://fathomless-sands-8466.herokuapp.com/api/get/on');
		}
			else if(state==="off"){
		$http.get('http://fathomless-sands-8466.herokuapp.com/api/get/off');		
		}        
			},
        tempPlus:function(){
            this.stemp++;
        },
        tempMinus:function(){
            this.stemp--;
        }
    }




    Pusher.subscribe("test_channel","my_event",function(data){
        $scope.model.temp=data.temp;

        console.log(data);

    });


    $scope.$on('$destroy', function () {
        Pusher.unsubscribe('items');
        console.log('Unsubscribed from items');
        Pusher.unsubscribe('activities');
        console.log('Unsubscribed from activities');
    })



});
app.directive('flash',function(){
    return{
        restrict:'A',
        link:function(scope,elem,attrs){
            scope.$watch(function(){
                return scope.model.temp;
            },function(newValue,oldValue){
                console.log(newValue);
                $(elem).delay(200).fadeOut('slow').delay(50).fadeIn('slow');
            })




        }
    }
})


app.provider('PusherService', function () {
    var scriptUrl = 'http://js.pusher.com/2.2/pusher.min.js';
    var scriptId = 'pusher-sdk';
    var apiKey = '';
    var initOptions = {};

    this.setPusherUrl = function (url) {
        if(url) scriptUrl = url;
        return this;
    };

    this.setOptions = function (options) {
        initOptions = options || initOptions;
        return this;
    };

    this.setToken = function (token) {
        apiKey = token || apiKey;
        return this;
    };

    // load the pusher api script async
    function createScript ($document, callback, success ) {
        var tag = $document.createElement('script');
        tag.type = 'text/javascript';
        tag.async = true;
        tag.id = scriptId;
        tag.src = scriptUrl;

        tag.onreadystatechange = tag.onload = function () {
            var state = tag.readState;
            if (!callback.done && (!state || /loaded|complete/.test(state))) {
                callback.done = true;
                callback();
            }
        };

        $document.getElementsByTagName('head')[0].appendChild(tag);
    }

    this.$get = ['$document', '$timeout', '$q', '$rootScope', '$window', '$location',
        function ($document, $timeout, $q, $rootScope, $window, $location) {
            var deferred = $q.defer();
            var pusher;

            function onSuccess () {
                pusher = new $window.Pusher(apiKey, initOptions);
            }

            var onScriptLoad = function (callback) {
                onSuccess();
                $timeout(function () {
                    deferred.resolve(pusher);
                });
            };

            createScript($document[0], onScriptLoad);
            return deferred.promise;
        }];

})

    .factory('Pusher', ['$rootScope', 'PusherService',
        function ($rootScope, PusherService) {
            return {



                subscribe: function (channelName, eventName, callback) {
                    PusherService.then(function (pusher) {
                        var channel = pusher.channel(channelName) || pusher.subscribe(channelName);
                        channel.bind(eventName, function (data) {
                            if (callback) callback(data);
                            $rootScope.$broadcast(channelName + ':' + eventName, data);
                            $rootScope.$digest();
                        });
                    });
                },

                unsubscribe: function (channelName) {
                    PusherService.then(function (pusher) {
                        pusher.unsubscribe(channelName);
                    });
                }
            };
        }
    ]);
app.config(function(PusherServiceProvider) {
    PusherServiceProvider
        .setToken('599a9eb32ff37b5469f7')
        //.setOptions({authEndpoint: "http://localhost/ffs/pusher_auth.php"});
});

angular.module('ayya1008.controllers', [])

.controller('AppCtrl', function($scope, $http, $cordovaNetwork, $cordovaSocialSharing, DataService, $cordovaPush, $ionicPlatform, $cordovaSplashscreen) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $ionicPlatform.ready(function(device) {
    var config = {
      senderID: '975008491239'
    };
    $cordovaPush.register(config);
  });

  $scope.server = {
    url: 'http://ayya.herokuapp.com/api/v1/'
  };

  $scope.isOfflineAvailable = function() {
    return DataService.isOfflineAvailable();
  }

  $scope.width = document.body.clientWidth - 20;

  $scope.share = function() {
    $cordovaSocialSharing.share('Share the app to your friends: - ', null, null, 'https://play.google.com/store/apps/details?id=in.iamsugan.ayya1008');
  };

  $scope.isOnline = function() {
    return navigator.onLine;
  };

  DataService.getTemples(true).then(function(temples) {
    $scope.$broadcast('TEMPLES_RECEIVED', temples);
    $cordovaSplashscreen.hide();
  });

  function handleAndroid(notification) {
    console.log("In foreground " + notification.foreground + " Coldstart " + notification.coldstart);
    if (notification.event == "registered") {
      $scope.regId = notification.regid;
      storeDeviceToken("android");
    } else if (notification.event == "message") {
      // $cordovaDialogs.alert(notification.message, "Push Notification Received");
      // $scope.$apply(function() {
      //   $scope.notifications.push(JSON.stringify(notification.message));
      // })
    }
    // else if (notification.event == "error")
    // $cordovaDialogs.alert(notification.msg, "Push notification error event");
    // else $cordovaDialogs.alert(notification.event, "Push notification handler - Unprocessed Event");
  }

  function storeDeviceToken(type) {
    var device = {
      platform: type,
      token: $scope.regId
    };

    DataService.registerDevice(device);

    // $http.post('http://192.168.1.16:8000/subscribe', JSON.stringify(user)).success(function(data, status) {
    //   console.log("Token stored, device is successfully subscribed to receive push notifications.");
    // }).error(function(data, status) {
    //   console.log("Error storing device token." + data + " " + status)
    // });
  }

  $scope.$on('$cordovaPush:notificationReceived', function(event, notification) {
    console.log(JSON.stringify([notification]));
    handleAndroid(notification);
  });
})

.controller('TemplesCtrl', function($scope, $stateParams, DataService) {
  $scope.isSpinnerVisible = true;

  var processTemples = function(temples) {
    $scope.temples = temples;
    $scope.currentTemples = _.filter($scope.temples, function(temple) {
      return temple.temple_type.toLowerCase() === $stateParams.templeType;
    });
    $scope.grouped = _.groupBy($scope.currentTemples, 'district');
    $scope.districts = Object.keys($scope.grouped);
    $scope.isSpinnerVisible = false;
  };

  DataService.getTemples().then(processTemples);

  $scope.templeType = $stateParams.templeType;

  $scope.$on('TEMPLES_RECEIVED', function(scope, temples) {
    processTemples(temples);
  });

  if ($stateParams.templeType === 'pathi') {
    $scope.title = 'பதிகள்';
  } else {
    $scope.title = 'நிழல்தாங்கள்கள்';
  }
})

.controller('TempleCtrl', function($scope, $stateParams, $cordovaGeolocation, $cordovaLaunchNavigator, DataService) {

  DataService.getTemples().then(function(temples) {

    $scope.temple = _.find(temples, {
      id: parseInt($stateParams.templeId)
    });

    $scope.temple.images = _.filter($scope.temple.images, function(url) {
      return url.indexOf('medium/missing.png') < 0;
    });

    if (!$scope.temple.images || $scope.temple.images.length === 0) {
      $scope.temple.images = ['../www/img/preview.png'];
      $scope.temple.noImage = true;
    }

    $scope.temple.events = _.chain($scope.temple.events).filter(function(event) {
      return new Date(event.date) >= new Date();
    }).map(function(temple) {
      temple.templeName = $scope.temple.name;
      return temple;
    }).sortBy(function(event) {
      return new Date(event.date);
    }).value();

    if (!$scope.$$phase) {
      $scope.$apply(function() {});
    }

    $scope.getDirections = function() {
      var posOptions = {
        timeout: 10000,
        enableHighAccuracy: false
      };
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
        var destination = [$scope.temple.latitude, $scope.temple.longitude];
        var start = [position.coords.latitude, position.coords.longitude];
        $cordovaLaunchNavigator.navigate(destination, start);
      });
    };

    $scope.marker = {
      options: {
        draggable: true
      },
      center: {
        latitude: $scope.temple.latitude,
        longitude: $scope.temple.longitude
      }
    };

    $scope.map = {
      center: {
        latitude: $scope.temple.latitude,
        longitude: $scope.temple.longitude
      },
      zoom: 11,
      options: {
        mapTypeControl: false,
        streetViewControl: false
      }
    };
  });
});
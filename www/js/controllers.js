angular.module('ayya1008.controllers', [])

.controller('AppCtrl', function($scope, $http, $cordovaNetwork, $cordovaSocialSharing, DataService, $ionicPlatform, $cordovaSplashscreen, $state) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $ionicPlatform.ready(function(device) {
    var config = {
      iconColor: '#FF9933'
    };
    var push = window.PushNotification.init({
      'android': {
        senderID: '975008491239',
        icon: 'ic_stat_temple',
        iconColor: '#FF9933'
      }
    });
    push.on('registration', function(data) {
      DataService.registerDevice({
        token: data.registrationId,
        platform: 'android'
      });
    });
    push.on('notification', function(data) {
      if (data.additionalData.coldstart) {
        $scope.message = data;
        $state.go('app.messages');
        console.log(data);
      }
    });
  });

  $scope.tamilMonths = ["சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"];
  $scope.districts = ["அரியலூர்", "சென்னை", "கோயம்புத்தூர்", "கடலூர்", "தர்மபுரி", "திண்டுக்கல்", "ஈரோடு", "காஞ்சிபுரம்", "கன்னியாகுமரி", "கரூர்", "கிருஷ்ணகிரி", "மதுரை", "நாகப்பட்டினம்", "நாமக்கல்", "பெரம்பலூர்", "புதுக்கோட்டை", "இராமநாதபுரம்", "சேலம்", "சிவகங்கை", "தஞ்சாவூர்", "தேனி", "நீலகிரி", "திருநெல்வேலி", "திருவள்ளூர்", "திருவண்ணாமலை", "திருவாரூர்", "தூத்துக்குடி", "திருச்சிராப்பள்ளி", "திருப்பூர்", "வேலூர்", "விழுப்புரம்", "விருதுநகர்"];

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
})

.controller('TemplesCtrl', function($scope, $stateParams, DataService, $ionicHistory) {
  $scope.isSpinnerVisible = true;

  $ionicHistory.nextViewOptions({
    historyRoot: true
  });

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

.controller('addTempleCtrl', function(DataService) {})

.controller('TempleCtrl', function($scope, $stateParams, $cordovaGeolocation, $cordovaLaunchNavigator, DataService, $ionicNavBarDelegate) {

  DataService.getTemples().then(function(temples) {

    $scope.temple = _.find(temples, {
      id: parseInt($stateParams.templeId)
    });

    $ionicNavBarDelegate.showBackButton(true);
    $ionicNavBarDelegate.title($scope.temple.name);

    console.log($scope.temple);
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
angular.module('ayya1008.controllers', [])

.controller('AppCtrl', function($scope, $http, $cordovaNetwork, $cordovaSocialSharing, DataService) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.server = {
    url: 'http://ayya.herokuapp.com/api/v1/',
    absPath: 'http://ayya.herokuapp.com'
  };

  $scope.isOfflineAvailable = DataService.isOfflineAvailable();

  // $scope.width = document.body.clientWidth - 20;

  $scope.share = function() {
    $cordovaSocialSharing.share('Share the app to your friends: - ', null, null, 'https://play.google.com/store/apps/details?id=in.iamsugan.ayya1008');
  };

  $scope.isOnline = function() {
    return navigator.onLine;
  };

  DataService.getEvents(true).then(function(events) {
    $scope.$broadcast('EVENTS_RECEIVED', events);
  });
  DataService.getTemples(true).then(function(temples) {
    $scope.$broadcast('TEMPLES_RECEIVED', temples);
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
    if ($scope.temples && $scope.temples.length > 0) {
      $scope.isSpinnerVisible = false;
    }
  };

  DataService.getTemples().then(processTemples);

  $scope.templeType = $stateParams.templeType;

  $scope.doRefresh = function() {
    DataService.getTemples(true).then(processTemples).finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.$on('TEMPLES_RECEIVED', function(scope, temples) {
    processTemples(temples);
  });

  if ($stateParams.templeType === 'pathi') {
    $scope.title = 'பதிகள்';
  } else {
    $scope.title = 'நிழல்தாங்கள்கள்';
  }
})

.controller('TestimoniesCtrl', function() {})

.controller('EventsCtrl', function($scope, $http, DataService) {
  $scope.isSpinnerVisible = true;

  var processEvents = function(events) {
    $scope.isSpinnerVisible = false;
    $scope.events = events;
    $scope.events = _.sortBy($scope.events, function(event) {
      return new Date(event.date);
    });
    $scope.futureEvents = _.filter($scope.events, function(event) {
      return new Date(event.date) >= new Date();
    });
    $scope.pastEvents = _.filter($scope.events, function(event) {
      return new Date(event.date) < new Date();
    });
  }
  DataService.getEvents().then(processEvents);
})

.controller('TestimonyCtrl', function($scope, $stateParams) {
  var testimonies = $scope.testimonies;
  for (var i = 0; i < testimonies.length; i++) {
    if (testimonies[i].id === $stateParams.testimonyId) {
      $scope.testimony = testimonies[i];
      $scope.page = {
        title: $scope.testimony.name + ', ' + $scope.testimony.village
      };
      break;
    }
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

    $scope.temple.events = _.chain($scope.temple.events).filter(function(event) {
      return new Date(event.date) >= new Date();
    }).map(function(temple) {
      temple.templeName = $scope.temple.name;
      return temple;
    }).sortBy(function(event) {
      return new Date(event.date);
    }).value();

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
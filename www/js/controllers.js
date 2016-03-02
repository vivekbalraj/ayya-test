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

  DataService.getTemples().then(function(temples) {
    $scope.temples = temples;
    $scope.$broadcast('DATA_PROCESSED');
  });

  DataService.getEvents();

  // $http({
  //   method: 'GET',
  //   url: 'fixtures/testimonies.json',
  //   data: {},
  //   transformResponse: function(data, headersGetter, status) {
  //     return {
  //       data: data
  //     };
  //   }
  // }).then(function(response) {
  //   $scope.testimonies = JSON.parse(response.data.data);
  // });
})

.controller('TemplesCtrl', function($scope, $stateParams) {
  $scope.isSpinnerVisible = true;

  var processData = function() {
    $scope.currentTemples = _.filter($scope.temples, function(temple) {
      return temple.temple_type.toLowerCase() === $stateParams.templeType;
    });
    $scope.grouped = _.groupBy($scope.currentTemples, 'district');
    $scope.districts = Object.keys($scope.grouped);
    if ($scope.temples && $scope.temples.length > 0) {
      $scope.isSpinnerVisible = false;
    }
  };

  $scope.templeType = $stateParams.templeType;

  if ($stateParams.templeType === 'pathi') {
    $scope.title = 'பதிகள்';
  } else {
    $scope.title = 'நிழல்தாங்கள்கள்';
  }
  $scope.$on('DATA_PROCESSED', processData);
  processData();
})

.controller('TestimoniesCtrl', function() {})

.controller('EventsCtrl', function($scope, $http, DataService) {
  $scope.isSpinnerVisible = true;
  DataService.getEvents().then(function(events) {
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
  });
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

.controller('TempleCtrl', function($scope, $stateParams, $cordovaGeolocation, $cordovaLaunchNavigator) {
  $scope.temple = _.find($scope.temples, {
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
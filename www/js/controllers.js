angular.module('ayya1008.controllers', [])

.controller('AppCtrl', function($scope, $http, $cordovaNetwork, $cordovaSocialSharing, DataService, $ionicPlatform,
  $state, $cordovaGoogleAnalytics) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.isAnalyticsReady = false;

  function _waitForAnalytics() {
    if (typeof analytics !== 'undefined') {
      $cordovaGoogleAnalytics.debugMode();
      $cordovaGoogleAnalytics.startTrackerWithId('UA-73626070-1');
      $scope.isAnalyticsReady = true;
    } else {
      setTimeout(function() {
        _waitForAnalytics();
      }, 250);
    }
  };
  _waitForAnalytics();

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
      }
    });
  });

  $ionicPlatform.registerBackButtonAction(function() {
    if ($state.current.name === 'app.temples.index') {
      navigator.app.exitApp();
    } else {
      navigator.app.backHistory();
    }
  }, 100);

  $scope.tamilMonths = ["", "சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை",
    "மார்கழி", "தை", "மாசி", "பங்குனி"];

  $scope.districts = ["அரியலூர்", "சென்னை", "கோயம்புத்தூர்", "கடலூர்", "தர்மபுரி", "திண்டுக்கல்", "ஈரோடு",
    "காஞ்சிபுரம்", "கன்னியாகுமரி", "கரூர்", "கிருஷ்ணகிரி", "மதுரை", "நாகப்பட்டினம்", "நாமக்கல்",
    "பெரம்பலூர்", "புதுக்கோட்டை", "இராமநாதபுரம்", "சேலம்", "சிவகங்கை", "தஞ்சாவூர்", "தேனி", "நீலகிரி",
    "திருநெல்வேலி", "திருவள்ளூர்", "திருவண்ணாமலை", "திருவாரூர்", "தூத்துக்குடி", "திருச்சிராப்பள்ளி",
    "திருப்பூர்", "வேலூர்", "விழுப்புரம்", "விருதுநகர்"];

  $scope.isOfflineAvailable = function() {
    return DataService.isOfflineAvailable();
  }

  $scope.width = document.body.clientWidth - 20;

  $scope.share = function() {
    $cordovaSocialSharing.share('Try this android app for Ayyavazhi: - ', null, null,
      'https://play.google.com/store/apps/details?id=in.iamsugan.ayya1008');
  };

  $scope.isOnline = function() {
    return navigator.onLine;
  };

  DataService.getTemples(true).then(function(temples) {
    $scope.$broadcast('TEMPLES_RECEIVED', temples);
  });
})

.controller('TemplesCtrl', function($scope, $stateParams, DataService, $cordovaGoogleAnalytics,
  $cordovaSplashscreen, $timeout) {

  $scope.isSpinnerVisible = true;
  if ($scope.isAnalyticsReady) {
    $cordovaGoogleAnalytics.trackView('Temple Screen');
  }

  var processTemples = function(temples) {
    $scope.temples = temples;
    $scope.currentTemples = _.filter($scope.temples, function(temple) {
      return temple.temple_type.toLowerCase() === $stateParams.templeType;
    });
    $scope.grouped = _.groupBy($scope.currentTemples, 'district');
    $scope.districts = Object.keys($scope.grouped);
    $scope.isSpinnerVisible = false;
    $timeout(function() {
      $cordovaSplashscreen.hide();
    }, 1000);
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

.controller('AddTempleCtrl', function($scope, DataService, $cordovaToast, $location, $ionicPopup, $ionicLoading) {
  $scope.temple = {
    name: '',
    year: '',
    tamilMonth: '',
    person: '',
    mobile: '',
    village: '',
    taluk: '',
    district: '',
    latitude: '',
    longitude: '',
    pincode: '',
    address: '',
    information: '',
    facebook: '',
    priest: ''
  };
  $scope.addTemple = function() {
    $ionicLoading.show();
    if ($scope.temple.name && $scope.temple.mobile) {
      DataService.addTemple({
        name: $scope.temple.name,
        founded_at: $scope.temple.year,
        book_month: $scope.temple.tamilMonth,
        contact_person: $scope.temple.person,
        mobile_number: $scope.temple.mobile,
        village: $scope.temple.village,
        taluk: $scope.temple.taluk,
        district: $scope.temple.districtOne,
        latitude: $scope.temple.latitude,
        longitude: $scope.temple.longitude,
        pincode: $scope.temple.pincode,
        steet_address: $scope.temple.address,
        information: $scope.temple.information,
        facebook_page_url: $scope.facebook,
        priest_name: $scope.priest
      }).then(function() {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'வெற்றி',
          template: 'மதிப்பாய்வு முடிந்த பிறகு பிரதிபலிக்கும்'
        });
        $location.path('/#/app/temples/pathi');
      }, function() {
        $ionicLoading.hide();
        $cordovaToast.showLongBottom('மீண்டும் முயற்சி செய்');
      });
    } else {
      $ionicPopup.alert({
        title: 'பிழை',
        template: 'பெயர் மற்றும் மொபைல் எண் காலியாக இருக்க முடியாது'
      });
    }
  };
})

.controller('MessagesCtrl', function($cordovaGoogleAnalytics, $scope) {
  if ($scope.isAnalyticsReady) {
    $cordovaGoogleAnalytics.trackEvent('Message', 'Message Read');
  }
})

.controller('ScripturesCtrl', function($cordovaGoogleAnalytics, $scope, $http) {
  if ($scope.isAnalyticsReady) {
    $cordovaGoogleAnalytics.trackEvent('Scripture', 'Scripture list');
  }

  $http({
    method: 'GET',
    url: '../www/data/scriptures.json',
    data: {},
    transformResponse: function(data, headersGetter, status) {
      return {
        data: data
      };
    }
  }).then(function(response) {
    $scope.scriptures = JSON.parse(response.data.data);
  });
})

.controller('ScriptureCtrl', function($cordovaGoogleAnalytics, $scope, $stateParams, $http) {
  if ($scope.isAnalyticsReady) {
    $cordovaGoogleAnalytics.trackEvent('Scripture', 'Scripture Read');
  }

  $scope.scriptureId = parseInt($stateParams.scriptureId);
  $http({
    method: 'GET',
    url: '../www/data/scriptures.json',
    data: {},
    transformResponse: function(data, headersGetter, status) {
      return {
        data: data
      };
    }
  }).then(function(response) {
    $scope.scriptures = JSON.parse(response.data.data);
    $scope.scripture = _.find($scope.scriptures, {
      id: $scope.scriptureId
    });
  });
})

.controller('MapsCtrl', function($cordovaGoogleAnalytics, $scope, DataService, $ionicLoading, $cordovaGeolocation,
  $timeout) {
  if ($scope.isAnalyticsReady) {
    $cordovaGoogleAnalytics.trackEvent('Maps', 'Maps screen view');
  }

  $ionicLoading.show();

  DataService.getTemples().then(function(temples) {
    $scope.markers = [];

    temples = _.filter(temples, function(temple) {
      return !!temple.latitude;
    });

    var posOptions = {
      timeout: 10000,
      enableHighAccuracy: false
    };

    $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
      var blue = {
        // path: 'M-7,0a7,7 0 1,0 14,0a7,7 0 1,0 -14,0',
        // fillColor: '#3E82F7',
        // fillOpacity: 0.8,
        // scale: 1,
        // strokeColor: '#FFFFFF',
        // strokeWeight: 3
        url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|3E82F7'
      };
      $scope.markers.push({
        options: {
          draggable: false,
          icon: blue
        },
        id: -100,
        center: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      });
    }).finally(function() {
      $timeout($ionicLoading.hide, 50);
    });

    $scope.map = {
      center: {
        latitude: 8.713913,
        longitude: 77.756652
      },
      zoom: 9,
      options: {
        mapTypeControl: false,
        streetViewControl: false,
        draggable: true
      },
      bounds: {
        northeast: {
          latitude: 14,
          longitude: 81
        },
        southwest: {
          latitude: 8,
          longitude: 77
        }
      }
    };

    _.each(temples, function(temple) {
      var cars = [];
      _.each(temple.cars, function(car) {
        cars.push(car.name);
      });
      temple.cars = cars.join(', ');
      $scope.markers.push({
        options: {
          draggable: true,
          icon: {
            url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF9933'
          }
        },
        temple: temple,
        id: temple.id,
        center: {
          latitude: temple.latitude,
          longitude: temple.longitude
        }
      });
    });
  });
})

.controller('TempleCtrl', function($scope, $stateParams, $cordovaGeolocation, $cordovaLaunchNavigator, DataService,
  $cordovaGoogleAnalytics) {
  if ($scope.isAnalyticsReady) {
    $cordovaGoogleAnalytics.trackView('Temple Screen');
  }

  DataService.getTemples().then(function(temples) {

    $scope.temple = _.find(temples, {
      id: parseInt($stateParams.templeId)
    });

    var cars = [];

    _.each($scope.temple.cars, function(car) {
      cars.push(car.name);
    });

    $scope.temple.cars = cars.join(', ');

    if ($scope.isAnalyticsReady) {
      $cordovaGoogleAnalytics.trackEvent('Temple', 'Temple viewed', $scope.temple.id, $scope.temple.name);
    }

    $scope.temple.images = _.filter($scope.temple.images, function(url) {
      return url.indexOf('medium/missing.png') < 0;
    });

    if (!$scope.temple.images || $scope.temple.images.length === 0) {
      $scope.temple.images = ['../www/img/preview.png'];
      $scope.temple.noImage = true;
    }

    $scope.temple.events = _.chain($scope.temple.events).filter(function(event) {
      return new Date(event.start_date) >= new Date() || !!!event.start_date;
    }).map(function(temple) {
      temple.templeName = $scope.temple.name;
      return temple;
    }).sortBy(function(event) {
      return new Date(event.start_date);
    }).value();

    if (!$scope.$$phase) {
      $scope.$apply(function() {});
    }

    $scope.getDirections = function() {
      if ($scope.isAnalyticsReady) {
        $cordovaGoogleAnalytics.trackEvent('Map', 'Google maps opened');
      }
      var posOptions = {
        timeout: 10000,
        enableHighAccuracy: false
      };
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
        var destination = [$scope.temple.latitude, $scope.temple.longitude];
        var start = [position.coords.latitude, position.coords.longitude];
        $cordovaLaunchNavigator.navigate(destination, start);
      }, function(err) {
        var destination = [$scope.temple.latitude, $scope.temple.longitude];
        $cordovaLaunchNavigator.navigate(destination, null);
      });
    };

    $scope.marker = {
      options: {
        draggable: false
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

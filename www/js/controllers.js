angular.module('ayya1008.controllers', [])

.controller('AppCtrl', function($scope, $http, $cordovaNetwork, $cordovaSocialSharing, DataService, $ionicPlatform,
  $state, $cordovaGoogleAnalytics, $window, $cordovaAppAvailability, $cordovaAppRate) {

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

  $scope.tamilMonths = ["", "சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை",
    "மார்கழி", "தை", "மாசி", "பங்குனி"
  ];

  $scope.districts = ["அரியலூர்", "சென்னை", "கோயம்புத்தூர்", "கடலூர்", "தர்மபுரி", "திண்டுக்கல்", "ஈரோடு",
    "காஞ்சிபுரம்", "கன்னியாகுமரி", "கரூர்", "கிருஷ்ணகிரி", "மதுரை", "நாகப்பட்டினம்", "நாமக்கல்",
    "பெரம்பலூர்", "புதுக்கோட்டை", "இராமநாதபுரம்", "சேலம்", "சிவகங்கை", "தஞ்சாவூர்", "தேனி", "நீலகிரி",
    "திருநெல்வேலி", "திருவள்ளூர்", "திருவண்ணாமலை", "திருவாரூர்", "தூத்துக்குடி", "திருச்சிராப்பள்ளி",
    "திருப்பூர்", "வேலூர்", "விழுப்புரம்", "விருதுநகர்"
  ];

  $scope.isOfflineAvailable = function() {
    return DataService.isOfflineAvailable();
  }

  $scope.width = document.body.clientWidth - 20;

  $scope.share = function() {
    $cordovaGoogleAnalytics.trackEvent('Share', 'App shared');
    $cordovaSocialSharing.share('Try this android app for Ayyavazhi: - ', null, null, 'https://goo.gl/5z1y2s');
  };

  $scope.isOnline = function() {
    return navigator.onLine;
  };

  DataService.getTemples(true);

  $scope.likeOnFacebook = function() {
    $cordovaAppAvailability.check('fb://').then(function() {
      $window.open('fb://page/1670714779914536', '_system');
    }, function() {
      $window.open('https://www.facebook.com/ayyapathi/', '_system');
    });
  };

  $scope.rateUs = function() {
    $cordovaAppRate.promptForRating(true).then(function(result) {
      // success
    });
  }

})

.controller('TemplesCtrl', function($scope, $stateParams, DataService, $cordovaGoogleAnalytics, $timeout,
  $ionicLoading) {

  DataService.getTemples(true).then(function(temples) {
    processTemples(temples);
  });

  $ionicLoading.show();
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
    $ionicLoading.hide();
  };

  DataService.getTemples().then(processTemples);

  $scope.templeType = $stateParams.templeType;

  if ($stateParams.templeType === 'pathi') {
    $scope.title = 'பதிகள்';
  } else {
    $scope.title = 'நிழல்தாங்கல்கள்';
  }
})

.controller('AddTempleCtrl', function($scope, DataService, $cordovaToast, $location, $ionicPopup, $ionicLoading, $ionicModal) {

  DataService.getVehicles().then(function(cars) {
    $scope.cars = cars;
    $scope.cars = _.map($scope.cars, function(car) {
      car.isSelected = false;
      return car;
    });
  });

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

  $ionicModal.fromTemplateUrl('vehicle-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  var mobileNumber;

  window.plugins.phonenumber.get(function success(phonenumber) {
    mobileNumber = phonenumber;
  });

  $scope.addTemple = function() {
    var cars = _.chain($scope.cars).filter(function(car) {
      return car.isSelected;
    }).map('id').value();
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
        priest_name: $scope.priest,
        cars: cars,
        device_no: mobileNumber
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

.controller('MessagesCtrl', function($cordovaGoogleAnalytics, $scope, DataService, $cordovaSocialSharing) {
  if ($scope.isAnalyticsReady) {
    $cordovaGoogleAnalytics.trackEvent('Message', 'Message Read', $scope.message.message, $scope.message.id);
  }

  if ($scope.message.additionalData && $scope.message.additionalData.temple) {
    DataService.getTemples().then(function(temples) {
      $scope.temple = _.find(temples, function(temple) {
        return temple.id === parseInt($scope.message.additionalData.temple);
      });
    });
  } else {
    DataService.getNotification($scope.message.id).then(function(notification) {
      $scope.message.additionalData.picture = notification.picture_url;
    });
  }

  $scope.shareMessage = function(message, image, platform) {
    $cordovaGoogleAnalytics.trackEvent('Message', 'Shared-Message', $scope.message.message, $scope.message.id);
    $cordovaGoogleAnalytics.trackEvent('Message', 'Shared-Platform', platform, $scope.message.id);
    if (platform === 'facebook') {
      $cordovaSocialSharing.shareViaFacebook(message, image, 'https://play.google.com/store/apps/details?id=in.iamsugan.ayya1008');
    } else if (platform === 'whatsapp') {
      $cordovaSocialSharing.shareViaWhatsApp(message, image, 'https://goo.gl/5z1y2s');
    }
  };
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

.controller('FeedCtrl', function($cordovaGoogleAnalytics, $scope, DataService, $cordovaSplashscreen, $timeout) {
  if ($scope.isAnalyticsReady) {
    $cordovaGoogleAnalytics.trackEvent('Feed', 'Feed Openned');
  }

  var page = 0;
  var forced = false;

  $scope.doRefresh = function() {
    page = 0;
    forced = true;
    $scope.loadMore();
  };

  if (!navigator.onLine && !$scope.isOfflineAvailable()) {
    $cordovaSplashscreen.hide();
    $scope.$broadcast('scroll.refreshComplete');
  }

  $scope.loadMore = function() {
    if (!navigator.onLine && !$scope.isOfflineAvailable()) {
      $cordovaSplashscreen.hide();
      $scope.$broadcast('scroll.refreshComplete');
    } else {
      DataService.getFeed(page, forced).then(function(response) {
        forced = true;
        var activities = _.uniqBy(response.activities, function(activity) {
          return activity.trackable_type + activity.trackable_id;
        });
        activities = _.sortBy(activities, 'created_at').reverse();
        activities = _.map(activities, function(activity) {
          var key = activity.key;
          activity.action = key.split('.')[1];
          if (activity.trackable_type === 'Temple') {
            activity.temple = _.find(response.temples, {
              id: activity.trackable_id
            });
            if (activity.temple.thumb === '/img1s/thumb/missing.png' || activity.temple.thumb === '/pictures/thumb/missing.png') {
              activity.temple.thumb = 'img/preview.png';
            }
            activity.link = '#/app/temples/' + activity.temple.temple_type.toLowerCase() + '/' + activity.temple.id;
          } else if (activity.trackable_type === 'Notification') {
            activity.notification = _.find(response.notifications, {
              id: activity.trackable_id
            });
            if (activity.notification.picture_url === '/pictures/original/missing.png') {
              activity.notification.picture_url = 'img/preview.png';
            }
          }
          return activity;
        });
        $scope.activities = _.concat($scope.activities, activities) || activities;
        page++;
      }).finally(function() {
        $cordovaSplashscreen.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
    }
  };
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
      $timeout($ionicLoading.hide, 1000);
    });

    $scope.map = {
      center: {
        latitude: (parseFloat(_.maxBy(temples, (temple) => parseFloat(temple.latitude)).latitude) + parseFloat(_.minBy(temples, (temple) => parseFloat(temple.latitude)).latitude)) / 2,
        longitude: (parseFloat(_.maxBy(temples, (temple) => parseFloat(temple.longitude)).longitude) + parseFloat(_.minBy(temples, (temple) => parseFloat(temple.longitude)).longitude)) / 2
      },
      zoom: 5,
      options: {
        mapTypeControl: false,
        streetViewControl: false,
        draggable: true
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
          draggable: false,
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

    DataService.updateTempleViewed($scope.temple.id);

    var cars = [];

    _.each($scope.temple.cars, function(car) {
      cars.push(car.name);
    });

    $scope.temple.cars = cars.join(', ');

    if ($scope.isAnalyticsReady) {
      $cordovaGoogleAnalytics.trackEvent('Temple', 'Temple viewed', $scope.temple.name, $scope.temple.id);
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

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('ayya1008', ['ionic', 'ayya1008.controllers', 'ngCordova', 'ayya1008.services', 'uiGmapgoogle-maps',
  'ngMessages', 'hm.readmore'
])

.run(function($ionicPlatform, $http, $rootScope, $cordovaToast, $ionicHistory, $cordovaPushV5, DataService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  var options = {
    android: {
      senderID: '975008491239',
      icon: 'ic_stat_temple',
      iconColor: '#FF9933'
    }
  };

  $cordovaPushV5.initialize(options).then(function() {

    $cordovaPushV5.onNotification();
    $cordovaPushV5.onError();
    $cordovaPushV5.register().then(function(registrationId) {
      DataService.registerDevice({
        token: registrationId,
        platform: 'android'
      });
    })
  });

  $rootScope.$on('$cordovaPushV5:errorOcurred', function(event, e) {
    console.log(event, e);
  });

  $ionicPlatform.registerBackButtonAction(function(event) {
    if ($rootScope.backButtonPressedOnceToExit) {
      ionic.Platform.exitApp();
    } else if ($ionicHistory.backView()) {
      $ionicHistory.goBack();
    } else {
      $rootScope.backButtonPressedOnceToExit = true;
      $cordovaToast.showShortBottom('வெளியேற மீண்டும் அழுத்தவும்...');
      setTimeout(function() {
        $rootScope.backButtonPressedOnceToExit = false;
      }, 2000);
    }
    event.preventDefault();
    return false;
  }, 100);
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, uiGmapGoogleMapApiProvider, $cordovaAppRateProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.temples', {
    url: '/temples/:templeType',
    abstract: true,
    views: {
      'menuContent': {
        template: '<ion-nav-view></ion-nav-view>'
      }
    }
  })

  .state('app.temples.index', {
    url: '',
    templateUrl: 'templates/temples.html',
    controller: 'TemplesCtrl'
  })

  .state('app.temples.detail', {
    url: '/:templeId',
    templateUrl: 'templates/temple.html',
    controller: 'TempleCtrl'
  })

  .state('app.scriptures', {
    url: '/scriptures',
    abstract: true,
    views: {
      'menuContent': {
        template: '<ion-nav-view></ion-nav-view>'
      }
    }
  })

  .state('app.scriptures.index', {
    url: '',
    templateUrl: 'templates/scriptures.html',
    controller: 'ScripturesCtrl'
  })

  .state('app.scriptures.detail', {
    url: '/:scriptureId',
    templateUrl: 'templates/scripture.html',
    controller: 'ScriptureCtrl'
  })

  .state('app.contact', {
    url: '/contact',
    views: {
      'menuContent': {
        templateUrl: 'templates/contact.html'
      }
    }
  })

  .state('app.addtemple', {
    url: '/add-temple',
    views: {
      'menuContent': {
        templateUrl: 'templates/add-temple.html',
        controller: 'AddTempleCtrl'
      }
    }
  })

  .state('app.maps', {
    url: '/maps',
    views: {
      'menuContent': {
        templateUrl: 'templates/maps.html',
        controller: 'MapsCtrl'
      }
    }
  })

  .state('app.feed', {
    url: '/feed',
    views: {
      'menuContent': {
        templateUrl: 'templates/feed.html',
        controller: 'FeedCtrl'
      }
    }
  })

  .state('app.messages', {
    url: '/messages',
    views: {
      'menuContent': {
        templateUrl: 'templates/messages.html',
        controller: 'MessagesCtrl'
      }
    }
  });

  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyCmU_GnOsVq-wNbisGQuxB_6l9e4ZF42N4',
    v: '3.23'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/feed');
  $ionicConfigProvider.tabs.position('bottom');
  var prefs = {
    language: 'ta',
    appName: 'Ayya 1008',
    androidURL: 'market://details?id=in.iamsugan.ayya1008',
  };

  $cordovaAppRateProvider.setPreferences(prefs)
});

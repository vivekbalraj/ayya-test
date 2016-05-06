angular.module('ayya1008.services', [])
  .service('DataService', function($http, $q) {
    var server = {
      url: 'http://ayya.herokuapp.com/api/v1/'
        // url: 'http://192.168.0.2:3000/api/v1/'
    };

    db = new loki('ayya1008.json', {
      autosave: true
    });
    db.loadDatabase();
    if (!db.getCollection('events')) {
      db.addCollection('events');
    }
    if (!db.getCollection('temples')) {
      db.addCollection('temples');
    }
    if (!db.getCollection('messages')) {
      db.addCollection('messages');
    }
    if (!db.getCollection('activities')) {
      db.addCollection('activities');
    }
    if (!db.getCollection('notifications')) {
      db.addCollection('notifications');
    }

    var upsert = function(collectionName, object) {
      var collection = this.db.getCollection(collectionName);
      var searchObject = {};
      searchObject.id = object.id;
      var result = collection.find(searchObject);
      if (result && result.length > 0) {
        object.$loki = result[0].$loki;
        object.meta = result[0].meta;
        result = object;
        this.db.getCollection(collectionName).update(result);
      } else {
        this.db.getCollection(collectionName).insert(object);
      }
    }

    var getTemples = function(forced) {
      var deferred = $q.defer();
      if (navigator.onLine) {
        var temples = db.getCollection('temples').chain().data();
        if (forced || (!temples || temples.length === 0)) {
          $http({
            method: 'GET',
            url: server.url + 'temples',
            data: {},
            transformResponse: function(data, headersGetter, status) {
              return {
                data: data
              };
            }
          }).then(function(response) {
            var temples = JSON.parse(response.data.data).temples;
            temples.forEach(function(temple) {
              upsert('temples', angular.copy(temple));
            });
            deferred.resolve(temples);
          });
        } else if (temples && temples.length > 0) {
          deferred.resolve(angular.copy(temples));
        }
      } else {
        deferred.resolve(db.getCollection('temples').chain().data());
      }
      return deferred.promise;
    };

    var isOfflineAvailable = function() {
      return (db.getCollection('temples').chain().data()).length > 0;
    };

    var registerDevice = function(device) {
      $http.post(server.url + 'devices', device);
    };

    var getMessages = function(page) {
      var deferred = $q.defer();
      if (navigator.onLine) {
        page = page || 0;
        $http({
          method: 'GET',
          url: server.url + 'notifications',
          data: {
            page: page
          },
          transformResponse: function(data, headersGetter, status) {
            return {
              data: data
            };
          }
        }).then(function(response) {
          var messages = JSON.parse(response.data.data).messages;
          messages.forEach(function(message) {
            upsert('messages', angular.copy(message));
          });
          deferred.resolve(messages);
        });
      } else {
        deferred.resolve(db.getCollection('messages').chain().data());
      }
      return deferred.promise;
    };

    var addTemple = function(temple) {
      var deferred = $q.defer();
      if (navigator.onLine) {
        $http({
          method: 'POST',
          url: server.url + 'temples',
          data: temple,
          transformResponse: function(data, headersGetter, status) {
            return {
              data: data
            };
          }
        }).then(function(response) {
          deferred.resolve();
        }, function(error) {
          deferred.reject();
        });
      }
      return deferred.promise;
    };

    var getFeed = function(page, forced) {
      var deferred = $q.defer();
      if (navigator.onLine) {
        page = page || 0;
        var activities = db.getCollection('activities').chain().data();
        if (activities && activities.length > 0 && !forced) {
          var notifications = db.getCollection('notifications').chain().data();
          var temples = db.getCollection('temples').chain().data();
          deferred.resolve({
            activities: activities,
            temples: temples,
            notifications: notifications
          });
        }
        $http({
          method: 'GET',
          url: server.url + 'activities',
          data: {
            page: page
          },
          transformResponse: function(data, headersGetter, status) {
            return {
              data: data
            };
          }
        }).then(function(response) {
          var activities = JSON.parse(response.data.data).activities;
          var temples = JSON.parse(response.data.data).temples;
          temples.forEach(function(temple) {
            upsert('temples', angular.copy(temple));
          });
          var notifications = JSON.parse(response.data.data).notifications;
          notifications.forEach(function(notification) {
            upsert('notifications', angular.copy(notification));
          });
          activities.forEach(function(activity) {
            upsert('activities', angular.copy(activity));
          });
          deferred.resolve(JSON.parse(response.data.data));
        });
      } else {
        var activities = db.getCollection('activities').chain().data();
        var temples = db.getCollection('temples').chain().data();
        var notifications = db.getCollection('notifications').chain().data();
        deferred.resolve({
          activities: activities,
          temples: temples,
          notifications: notifications
        });
      }
      return deferred.promise;
    };

    var getNotification = function(id) {
      var deferred = $q.defer();
      if (navigator.onLine) {
        $http({
          method: 'GET',
          url: server.url + 'notifications',
          params: {
            id: id
          },
          transformResponse: function(data, headersGetter, status) {
            return {
              data: data
            };
          }
        }).then(function(response) {
          var notification = JSON.parse(response.data.data).notification[0];
          upsert('notifications', angular.copy(notification));
          deferred.resolve(notification);
        });
      } else {
        var notifications = db.getCollection('notifications').chain().data();
        deferred.resolve(_.find(notifications, {
          id: id
        }));
      }
      return deferred.promise;
    };

    var updateTempleViewed = function(id) {
      var deferred = $q.defer();
      if (navigator.onLine) {
        $http({
          method: 'POST',
          url: server.url + 'temples/view-temple',
          params: {
            id: id
          },
          transformResponse: function(data, headersGetter, status) {
            return {
              data: data
            };
          }
        }).then(function(response) {
          deferred.resolve(response);
        });
      }
      return deferred.promise;
    };

    return {
      getTemples: getTemples,
      getMessages: getMessages,
      isOfflineAvailable: isOfflineAvailable,
      registerDevice: registerDevice,
      addTemple: addTemple,
      getFeed: getFeed,
      getNotification: getNotification,
      updateTempleViewed: updateTempleViewed
    };
  });

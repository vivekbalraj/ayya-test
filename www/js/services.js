angular.module('ayya1008.services', [])
  .service('DataService', function($http, $q) {
    var server = {
      url: 'http://ayya.herokuapp.com/api/v1/'
      // url: 'http://localhost:3000/api/v1/'
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

    var upsert = function(collectionName, object) {
      var collection = this.db.getCollection(collectionName);
      var searchObject = {};
      searchObject.id = object.id;
      var result = collection.find(searchObject);
      if (result && result.length > 0) {
        result = _.merge(object, result[0]);
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
          deferred.resolve(temples);
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

    return {
      getTemples: getTemples,
      getMessages: getMessages,
      isOfflineAvailable: isOfflineAvailable,
      registerDevice: registerDevice
    };
  });
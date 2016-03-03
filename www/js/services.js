angular.module('ayya1008.services', [])
  .service('DataService', function($http, $q) {
    var server = {
      url: 'http://ayya.herokuapp.com/api/v1/'
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
        }
        if (temples && temples.length > 0) {
          deferred.resolve(temples);
        }
      } else {
        deferred.resolve(db.getCollection('temples').chain().data());
      }
      return deferred.promise;
    };

    var getEvents = function(forced) {
      var deferred = $q.defer();
      if (navigator.onLine) {
        var events = db.getCollection('events').chain().data();
        if (forced || (!events || events.length === 0)) {
          $http({
            method: 'GET',
            url: server.url + 'events',
            data: {},
            transformResponse: function(data, headersGetter, status) {
              return {
                data: data
              };
            }
          }).then(function(response) {
            var events = JSON.parse(response.data.data).events;
            events.forEach(function(event) {
              upsert('events', angular.copy(event));
            });
            deferred.resolve(events);
          });
        }
        if (events && events.length) {
          deferred.resolve(events);
        }
      } else {
        deferred.resolve(db.getCollection('events').chain().data());
      }
      return deferred.promise;
    };

    var isOfflineAvailable = function() {
      return (db.getCollection('events').chain().data()).length > 0 && (db.getCollection('temples').chain().data()).length > 0;
    };

    return {
      getTemples: getTemples,
      getEvents: getEvents,
      isOfflineAvailable: isOfflineAvailable
    };
  });
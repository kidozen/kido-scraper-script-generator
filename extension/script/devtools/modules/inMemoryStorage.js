'use strict';
// This module can be loaded both from the background page or from the extension itself. The former does not use Common JS.
if (typeof require === 'function') {
    require('angular');
}

var bootstrapInMemoryStorageModule = function () {

    angular.module("inMemoryStorage", [])
        .factory('inMemoryStorage', function ($q) {
            var storage = {};

            return {
                clearCache: function () {
                    storage = {};
                },
                drop: function (key) {
                    delete storage[key];
                },
                get: function (key) {
                    alert('[inMemoryStorage] Getting ' + key);
                    var deferred = $q.defer();
                    if (key) {
                        deferred.resolve(storage[key] ? storage[key] : undefined);
                    } else {
                        var allValues = Object.keys(storage).map(function (item) {
                            return storage[item].toJson();
                        });
                        deferred.resolve(allValues ? allValues : []);
                    }
                    return deferred.promise;
                },
                /**
                 * gets the value of key from the cache, or calls the fallback function, and populates the cache
                 * with the value of the promise returned
                 */
                getOrElse: function (key, fallback) {
                    var deferred = $q.defer();
                    var value = storage[key];

                    if (value == undefined || value == null) {
                        fallback().then(function (data) {
                            value = data;
                            storage[key] = value;
                        });
                    }
                    deferred.resolve(value);
                    return deferred.promise;
                },
                set: function (key, value) {
                    storage[key] = value;
                }
            };
        });
};

var inMemoryStorageModule = bootstrapInMemoryStorageModule();

if (typeof module === 'object') {
    module.exports = inMemoryStorageModule;
}
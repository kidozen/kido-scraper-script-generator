'use strict';
// This module can be loaded both from the background page or from the extension itself. The former does not use Common JS.
if (typeof require === 'function') {
    require('angular');
}

var bootstrapChromeStorageModule = function () {

    angular.module("chromeStorage", [])
        .factory('chromeStorage', function ($q) {
            var area = null;
            try {
                area = chrome.storage.sync; // feel free to change this. valid values: [chrome.storage.local, chrome.storage.sync]
            } catch (err) {
                alert("could not initiate chrome local storage: " + err);
            }

            var theStorage = {};

            theStorage.get = function (key) {
                if (typeof require === 'function') {
                    alert('[chromeStorage] Getting ' + key + ' from the extension...');
                } else {
                    alert('[chromeStorage] Getting ' + key + ' from the background page...');
                }
                var deferred = $q.defer();
                alert("About to invoke chrome storage API");
                area.get(key, function (value) {
                    alert('Chrome Storage API returned: ' + value);
                    var keyValue = value[key];
                    deferred.resolve(value);
                });
                alert("Done invoking chrome storage API");
                return deferred.promise;
            };

            theStorage.set = function (key, value) {
                var saveObject = {};
                saveObject[key] = value;
                area.set(saveObject, function () {
                    if (chrome.runtime.lasterror) {
                        console.error(chrome.runtime.lasterror.message);
                    } else {
                        console.log('saved ' + value + " to key " + key);
                    }
                });
            };
            if (typeof require === 'function') {
                return wrapAllFunctionsOf(theStorage, "chromeStorageCall");
            } else {
                return theStorage;
            }
        });
};

var chromeStorageModule = bootstrapChromeStorageModule();

if (typeof module === 'object') {
    module.exports = chromeStorageModule;
}
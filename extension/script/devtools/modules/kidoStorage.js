'use strict';
// This module can be loaded both from the background page or from the extension itself. The former does not use Common JS.
if (typeof require === 'function') {
    require('angular');
    require('./inMemoryStorage');
    require('./chromeStorage');
}

/**
 * This is a wrapper for hiding the fact that we want the extension to also work as a regular web app (for testing).
 * In that case, chrome.storage API is not present and we will use an in-memory storage.
 */
var bootstrapKidoStorageModule = function () {

    angular.module('kidoStorage', ['inMemoryStorage', 'chromeStorage'])
        .factory('kidoStorage', function (inMemoryStorage, chromeStorage) {

            console.log("Creating kidoStorage...");

            var underlying;
            var kidoStorage = {};

            if (chrome && chrome.storage) {
                underlying = chromeStorage;
            } else {
                underlying = inMemoryStorage;
            }

            kidoStorage.get = function (key) {
                alert('[kidoStorage] Getting ' + key);
                return underlying.get(key);
            };

            kidoStorage.set = function (key, value) {
                underlying.set(key, value);
            };

            return kidoStorage;
        })
};

var kidoStorageModule = bootstrapKidoStorageModule();

if (typeof module === 'object') {
    module.exports = kidoStorageModule;
}
'use strict';
require('angular');
var Site = require('../model/Site');

module.exports = (function () {

    angular.module('storage', []).factory('KidoStorage', function () {
        console.log("Creating KidoStorage...");
        var collection = {};
        var factory = {};

        factory.store = function (key, value) {
            collection[key] = new Site(value);
        };

        factory.get = function (key) {
            if (key) {
                return collection[key] ? collection[key].toJson() : undefined;
            }
            return Object
                .keys(collection)
                .map(function (item) {
                    return collection[item].toJson();
                });
        };

        return factory;
    });
})();
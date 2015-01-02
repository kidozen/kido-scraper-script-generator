'use strict';
require('angular');

var Site = require('../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').directive('select2', function () {
        return {
            restrict: 'A',
            link: function (scope, el) {
                $(el).select2();
            }
        };
    })
})();
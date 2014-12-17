'use strict';
require('angular');

var Site = require('../model/Site');

module.exports = (function () {

    // TODO How is this function useful? Should we get rid of it?
    angular.module('KidoScraper').directive('select2', function () {
        return {
            restrict: 'A',
            link: function (scope, el) {
                $(el).select2();
            }
        };
    })
})();
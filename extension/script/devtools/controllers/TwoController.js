'use strict';
require('angular');
var Site = require('../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('TwoController', function ($scope, $routeParams, $location, KidoStorage) {
        console.log('Loading Two Controller...');

        if (!$routeParams.name) {
            return $location.path('/');
        }
        $scope.types = [{
            id: Site.TYPES.FORM,
            name: 'Form'
        }, {
            id: Site.TYPES.CLICK,
            name: 'Click'
        }, {
            id: Site.TYPES.SCRAPE,
            name: 'Scrap'
        }];
        $scope.stepType = $scope.types[0].id;
        $scope.site = KidoStorage.get($routeParams.name);
        $scope.site.steps = $scope.site.steps || [];
        function _addStep(type) {
            $location.path('/three/' + $routeParams.name + '/' + type);
        }

        $scope.addStep = function () {
            _addStep($scope.stepType);
        };
        $scope.addCompleteForm = function () {
            _addStep(Site.TYPES.FORM);
        };
        $scope.addClickEvent = function () {
            _addStep(Site.TYPES.CLICK);
        };
        $scope.addScrape = function () {
            _addStep(Site.TYPES.SCRAPE);
        };
        $scope.export = function (site) {
            $location.path('/export/' + site.name);
        };
    })
})();
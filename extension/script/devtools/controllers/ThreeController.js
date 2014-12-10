'use strict';
require('angular');
var Site = require('../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('ThreeController', function ($scope, $routeParams, $location, KidoStorage) {
        console.log('Loading Three Controller...');

        if (!$routeParams.name || !$routeParams.type) {
            return $location.path('/');
        }
        $scope.site = KidoStorage.get($routeParams.name);
        $scope.currentStep = Site.getDefaults($routeParams.type);
        $scope.isForm = $scope.currentStep.type === Site.TYPES.FORM;
        $scope.isClick = $scope.currentStep.type === Site.TYPES.CLICK;
        $scope.isScrape = $scope.currentStep.type === Site.TYPES.SCRAPE;
        $scope.submit = function () {
            try {
                Site.validateStep($scope.currentStep);
            } catch (exception) {
                return window.alert(exception.toString());
            }
            $scope.site.steps.push($scope.currentStep);
            KidoStorage.store($routeParams.name, $scope.site);
            $location.path('/two/' + $scope.site.name);
        };
        $scope.cancel = function () {
            $location.path('/two/' + $scope.site.name);
        };
    })
})();
'use strict';
require('angular');
var Site = require('../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('ExportController', function ($scope, $routeParams, $location, KidoStorage) {
        console.log('Loading Export Controller...');

        if (!$routeParams.name) {
            return $location.path('/');
        }
        $scope.site = KidoStorage.get($routeParams.name);
        $scope.json = JSON.stringify($scope.site, 0, 4);
        $scope.script = new Site($scope.site).toCasper();
        $scope.scriptVisible = true;
        $scope.showJson = function () {
            $scope.jsonVisible = true;
            $scope.scriptVisible = false;
        };
        $scope.showScript = function () {
            $scope.jsonVisible = false;
            $scope.scriptVisible = true;
        };
    })
})();
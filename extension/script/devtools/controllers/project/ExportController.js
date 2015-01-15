'use strict';
require('angular');
var Site = require('../../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('ExportController', function ($scope, $routeParams, $location, RunInBackgroundScript, AngularScope) {
        console.log('Loading Export Controller...');

        if (!$routeParams.name) {
            return $location.path('/');
        }
        RunInBackgroundScript.getFromLocalStorage($routeParams.name).done(function (siteAsJson) {
            AngularScope.apply($scope, function () {
                $scope.site = siteAsJson;
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

                $scope.createDatasource = function() {
                    $location.path('/datasources/create/' + $scope.site.name);
                }
            });
        });
    })
})();
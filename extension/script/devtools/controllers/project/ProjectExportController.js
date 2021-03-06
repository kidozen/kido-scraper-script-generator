'use strict';
require('angular');

var kidoScraper = require('../../KidoScraper');
var Site = require('../../model/Site');

require('../../services/RunInBackgroundScript');
require('../../services/AngularScope');

module.exports = (function () {

    kidoScraper.controller('ProjectExportController', function ($scope, $routeParams, $location, RunInBackgroundScript, AngularScope) {
        console.log('Loading Project Export Controller...');

        var options = {parameterizable: true};

        if (!$routeParams.name) {
            return $location.path('/');
        }
        $scope.breadcrumbReplacements = {'Project Name': $routeParams.name};

        RunInBackgroundScript.getFromLocalStorage($routeParams.name).done(function (siteAsJson) {
            AngularScope.apply($scope, function () {
                $scope.site = siteAsJson;
                $scope.json = JSON.stringify(new Site($scope.site).toJson(options), 0, 4);
                $scope.script = new Site($scope.site).toCasper(options);

                $scope.showJson = function () {
                    $scope.jsonVisible = true;
                };

                $scope.showScript = function () {
                    $scope.jsonVisible = false;
                };

                $scope.createDatasource = function() {
                    // We pass an empty service name as we do not know that detail here...
                    var serviceName = '';
                    var method = $scope.jsonVisible ? 'runJson' : 'runScript';
                    $location.path('/datasources/create/' + $scope.site.name + '/' + serviceName + '/' + method);
                }
            });
        });
    });
})();
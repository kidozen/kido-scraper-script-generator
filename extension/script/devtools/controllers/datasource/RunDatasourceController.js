'use strict';
require('angular');
var Site = require('../../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('RunDatasourceController', function ($scope, $routeParams, $location, $http, RunInBackgroundScript, AngularScope, baseErrorHandler, datasourceService, serviceService) {
        console.log('Loading Run Datasource Controller...');

        if (!$routeParams.dsName) {
            return $location.path('/');
        }
        $scope.dsName = $routeParams.dsName;

        // TODO This is a clear candidate to be refactored out, to a service that deals with user session, auth credentials, etc...
        RunInBackgroundScript.getFromLocalStorage(RunInBackgroundScript.lastUsedMarketplaceURL).done(function (lastUsedMarketplaceURL) {
            AngularScope.apply($scope, function () {
                $scope.marketplaceURL = lastUsedMarketplaceURL;

                datasourceService.getDatasourceByName($scope.dsName, $scope.marketplaceURL, function (error, datasource) {
                    if (error) return;
                    $scope.datasource = datasource;
                });

                $scope.run = function () {
                    if (!$scope.datasource) {
                        alert("Could not determine the datasource to be run!");
                        return;
                    }
                    $scope.running = true;

                    datasourceService.runDatasource($scope.datasource, $scope.marketplaceURL, function (error, results) {
                        if (error) return;
                        $scope.executionResult = JSON.stringify(results, null, 2);
                        $scope.running = false;
                    });
                };

                $scope.back = function () {
                    $scope.executionResult = null;
                };
            });
        });
    });
})();
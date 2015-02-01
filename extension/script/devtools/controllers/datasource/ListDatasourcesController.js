'use strict';
require('angular');
var Site = require('../../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('ListDatasourcesController', function ($scope, $routeParams, $location, $http, RunInBackgroundScript, AngularScope, baseErrorHandler, datasourceService) {
        console.log('Loading List Datasources Controller...');

        // TODO This is a clear candidate to be refactored out, to a service that deals with user session, auth credentials, etc...
        RunInBackgroundScript.getFromLocalStorage(RunInBackgroundScript.lastUsedMarketplaceURL).done(function (lastUsedMarketplaceURL) {
            AngularScope.apply($scope, function () {
                $scope.marketplaceURL = lastUsedMarketplaceURL;

                datasourceService.getAllDatasources($scope.marketplaceURL, function (error, allDatasources) {
                    if (error) return;
                    $scope.datasources = allDatasources;
                });

                $scope.runDatasource = function (datasource) {
                    if (!datasource) {
                        alert("Could not determine the datasource to run the script with!");
                        return;
                    }
                    $location.path('/datasources/' + datasource.name + '/run');
                };

                $scope.deleteDatasource = function (index) {
                    var datasource = $scope.datasources[index];

                    datasourceService.deleteDatasource(datasource, $scope.marketplaceURL, function(error, outcome) {
                        if (error) return;

                        if (outcome && outcome.deleted) {
                            $scope.datasources.splice(index, 1);
                        }
                    });
                };
            });
        });
    });
})();
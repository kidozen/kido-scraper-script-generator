'use strict';
require('angular');
var Site = require('../../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('CreateDatasourceController', function ($scope, $routeParams, $location, $http, RunInBackgroundScript, AngularScope, baseErrorHandler, datasourceService, serviceService) {
        console.log('Loading CreateDatasource Controller...');

        $scope.serviceName = $routeParams.serviceName;
        $scope.siteName = $routeParams.siteName;
        $scope.projectNameWasSpecified = $scope.siteName != null;
        $scope.serviceNameWasSpecified = $scope.serviceName != null;
        $scope.methods = ['runJson', 'runScript'];
        $scope.timeout = 60;

        // TODO This is a clear candidate to be refactored out, to a service that deals with user session, auth credentials, etc...
        RunInBackgroundScript.getFromLocalStorage(RunInBackgroundScript.lastUsedMarketplaceURL).done(function (lastUsedMarketplaceURL) {
            AngularScope.apply($scope, function () {
                $scope.marketplaceURL = lastUsedMarketplaceURL;

                //TODO Create a "projectService" that deals with the details of how to retrieve projects
                RunInBackgroundScript.getFromLocalStorage(null).done(function (allSites) {
                    AngularScope.apply($scope, function () {
                        $scope.projects = allSites;
                    });
                });

                serviceService.getAllServices($scope.marketplaceURL, function (error, services) {
                    if (error) {
                        return baseErrorHandler.handleError(error, "Error while attempting to retrieve services", $scope.marketplaceURL);
                    }
                    $scope.services = services;

                    $scope.createNewDatasource = function () {

                        if (siteNameIsNotPresent()) {
                            return;
                        }
                        RunInBackgroundScript.getFromLocalStorage($scope.siteName).done(function (siteAsJson) {
                            AngularScope.apply($scope, function () {
                                $scope.site = new Site(siteAsJson);

                                var datasource = {};
                                datasource.name = $scope.newDatasourceName;
                                datasource.description = $scope.description;
                                datasource.type = 'query';
                                datasource.serviceName = $scope.serviceName;
                                datasource.serviceType = 'webauthorapi';
                                datasource.operationName = $scope.method;
                                datasource.timeout = $scope.timeout;
                                datasource.cache = '0';
                                datasource.params = $scope.site.getAllParams();
                                datasource.body = $scope.method === 'runJson' ?
                                    JSON.stringify({json: $scope.site.toJson(true)}) :
                                    JSON.stringify({script: $scope.site.toCasper(true)});

                                datasourceService.createDatasource(datasource, $scope.marketplaceURL, function (error) {
                                    if (error) {
                                        baseErrorHandler.handleError(error, "Error while creating datasource '" + datasource.name + "'", $scope.marketplaceURL);
                                        return;
                                    }
                                    $location.path('/datasources');
                                });
                            });
                        });
                    };

                    var siteNameIsNotPresent = function () {
                        if (!$scope.siteName) {
                            alert('Please specify the site name');
                            return true;
                        }
                        return false;
                    };
                });
            });
        });
    });
})();
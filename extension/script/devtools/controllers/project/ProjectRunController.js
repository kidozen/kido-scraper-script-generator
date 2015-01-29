'use strict';
require('angular');
var Site = require('../../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('ProjectRunController', function ($scope, $routeParams, $location, $http,
                                                                               RunInBackgroundScript, AngularScope, baseErrorHandler,
                                                                               serviceService, agentService) {
        console.log('Loading Project Run Controller...');

        if (!$routeParams.name) {
            return $location.path('/');
        }
        $scope.timeout = 60; //default, can be changed by the user
        $scope.running = false;

        RunInBackgroundScript.getFromLocalStorage(RunInBackgroundScript.lastUsedMarketplaceURL).done(function (lastUsedMarketplaceURL) {
            AngularScope.apply($scope, function () {
                $scope.marketplaceURL = lastUsedMarketplaceURL;
            });
        });
        RunInBackgroundScript.getFromLocalStorage($routeParams.name).done(function (siteAsJson) {
            AngularScope.apply($scope, function () {
                $scope.site = siteAsJson;

                serviceService.getAllServices($scope.marketplaceURL, function (error, services) {
                    if (error) {
                        return baseErrorHandler.handleError(error, "Error while attempting to retrieve services", $scope.marketplaceURL);
                    }
                    $scope.services = services;
                });

                agentService.getAllAgents($scope.marketplaceURL, function (error, agents) {
                    if (error) {
                        return baseErrorHandler.handleError(error, "Error while attempting to retrieve agents", $scope.marketplaceURL);
                    }
                    // artificially add the 'kidozen' (cloud) option
                    agents.unshift({name: 'kidozen', type: 'cloud'});
                    $scope.agents = agents;
                });

                $scope.createNewService = function () {
                    var service = {};
                    service.name = $scope.newServiceName;
                    service.runOn = $scope.runOn;
                    service.enterpriseApi = 'webauthorapi';
                    service.config = {};

                    if (serviceService.serviceIsInvalid(service, $scope.services)) return;

                    if (service.runOn.type === 'cloud') {
                        service.runOn.type = 'hub';
                    }
                    serviceService.createService(service, $scope.services, $scope.marketplaceURL, function (error) {
                        if (error) {
                            return baseErrorHandler.handleError(error, "Error while attempting to create a new service", $scope.marketplaceURL);
                        }
                        if (service.runOn.type === 'hub') {
                            service.runOn.type = 'cloud';
                        }
                        $scope.services.push(service);
                        $scope.newServiceName = '';
                        $scope.runOn = null;
                    });
                };

                $scope.deleteService = function (index) {
                    var service = $scope.services[index];

                    if (!service) {
                        alert("Could not determine the service to be deleted");
                        return;
                    }
                    if (!confirm("Are you sure you want to delete the service '" + service.name + "'?")) {
                        return;
                    }
                    // TODO Move this to ServiceService.js
                    RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                        $http({
                            method: 'POST',
                            url: $scope.marketplaceURL + 'api/admin/v2/services/' + service.name + "/disable",
                            cache: false,
                            headers: {
                                'Authorization': token
                            }
                        }).then(function (response) {
                            var retries = 3;
                            var deleteService = function () {
                                $http({
                                    method: 'DELETE',
                                    url: $scope.marketplaceURL + 'api/admin/services/' + service.name,
                                    headers: {
                                        'Authorization': token,
                                        'timeout': $scope.timeout,
                                        "Content-Type": "application/json"
                                    }
                                }).then(function (response) {
                                    $scope.services.splice(index, 1);
                                }, function (error) {
                                    if (retries-- > 0) {
                                        deleteService();
                                    } else {
                                        baseErrorHandler.handleError(error, "An error occurred while deleting the service instance " + service.name, $scope.marketplaceURL);
                                    }
                                });
                            };
                            deleteService();

                        }, function (error) {
                            baseErrorHandler.handleError(error, "An error occurred while disabling the service instance " + service.name, $scope.marketplaceURL);
                        });
                    });
                };
                $scope.runIn = function (service) {
                    if (!service) {
                        alert("Could not determine the service to run the script with!");
                        return;
                    }
                    if (timeoutIsInvalid()) {
                        return;
                    }
                    $scope.lastUsedService = service;
                    $scope.running = true;

                    // TODO Move this to ServiceService.js
                    RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                        $http({
                            method: 'POST',
                            url: $scope.marketplaceURL + 'api/admin/services/' + service.name + '/invoke/runJson',
                            headers: {
                                'Authorization': token,
                                'timeout': $scope.timeout,
                                "Content-Type": "application/json"
                            },
                            data: {json: new Site($scope.site).toJson()}
                        }).then(function (response) {
                            if (response.status !== 200 || response.data.error) {
                                alert("The service invocation produced an error: " + response.statusText + " / " + JSON.stringify(response.data, null, 2));
                            } else {
                                $scope.executionResult = JSON.stringify(response.data, null, 2);
                            }
                            $scope.running = false;
                        }, function (error) {
                            baseErrorHandler.handleError(error, "Error while invoking the method 'runJson'", $scope.marketplaceURL);
                            $scope.running = false;
                        });
                    });
                };
                $scope.createDatasource = function (service) {
                    if (!service) {
                        alert("Could not determine the service the datasource will be associated to!");
                        return;
                    }
                    $location.path('/datasources/create/' + $scope.site.name + '/' + service.name);
                };

                $scope.runAgain = function () {
                    $scope.runIn($scope.lastUsedService);
                };

                $scope.back = function () {
                    $scope.executionResult = null;
                };

                var timeoutIsInvalid = function () {
                    if (!$scope.timeout || $scope.timeout.toString().match(/[^0-9]+/) != null) {
                        alert("The timeout must be a positive integer!");
                        return true;
                    }
                    return false;
                };
            });
        });
    });
})();
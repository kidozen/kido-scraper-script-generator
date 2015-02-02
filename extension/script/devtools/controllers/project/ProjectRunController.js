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
        $scope.breadcrumbReplacements = {'Project Name': $routeParams.name};
        $scope.timeout = 60; //default, can be changed by the user
        $scope.running = false;
        $scope.selectedService = undefined;

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

                $scope.run = function () {
                    if (!$scope.selectedService) {
                        alert("Please choose the service to run the script with!");
                        return;
                    }
                    if (timeoutIsInvalid()) {
                        return;
                    }
                    $scope.running = true;

                    // TODO Move this to ServiceService.js
                    RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                        $http({
                            method: 'POST',
                            url: $scope.marketplaceURL + 'api/admin/services/' + $scope.selectedService.name + '/invoke/runJson',
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
                $scope.createDatasource = function () {
                    if (!$scope.selectedService) {
                        alert("Could not determine the service the datasource will be associated to!");
                        return;
                    }
                    $location.path('/datasources/create/' + $scope.site.name + '/' + $scope.selectedService.name);
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
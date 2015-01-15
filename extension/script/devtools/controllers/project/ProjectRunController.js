'use strict';
require('angular');
var Site = require('../../model/Site');

//TODO Refactor this class as it got too large and convoluted

module.exports = (function () {

    angular.module('KidoScraper').controller('ProjectRunController', function ($scope, $routeParams, $location, $http, RunInBackgroundScript, AngularScope, baseErrorHandler, serviceService) {
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
                $scope.authRequired = true;

                $scope.authenticate = function () {
                    if (!$scope.marketplaceURL) {
                        alert("The Marketplace URL is required");
                        return;
                    }
                    // Standardize all marketplace URLs to have a trailing slash
                    $scope.marketplaceURL = $scope.marketplaceURL.replace(/\/?$/, '/');

                    serviceService.getAllServices($scope.marketplaceURL, function (error, services) {
                        if (error) {
                            return baseErrorHandler.handleError(error, "Error while attempting to retrieve services", $scope.marketplaceURL);
                        }
                        $scope.services = services;
                        $scope.authRequired = false;

                        // TODO Abstract this out to an "AgentService"
                        RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                            $http({
                                method: 'GET',
                                url: $scope.marketplaceURL + 'api/admin/agents',
                                headers: {'Authorization': token},
                                cache: false,
                                ignoreLoadingBar: true
                            }).then(function (response) {
                                if (response.data && typeof Array.isArray(response.data)) {
                                    response.data.forEach(function (agent) {
                                        agent.type = 'agent';
                                        delete agent._id;
                                        delete agent.services;
                                    });
                                } else {
                                    response.data = [];
                                }
                                // artificially add the 'kidozen' (cloud) option
                                response.data.unshift({name: 'kidozen', type: 'cloud'});
                                $scope.agents = response.data;
                            }, function (error) {
                                baseErrorHandler.handleError(error, "Error while attempting to retrieve agents", $scope.marketplaceURL);
                            });
                        });
                    });
                };
                $scope.createNewService = function () {
                    if (newServiceNameIsInvalid() || runOnIsInvalid() || timeoutIsInvalid()) {
                        return;
                    }
                    var service = {};
                    service.name = $scope.newServiceName;
                    service.runOn = $scope.runOn;
                    service.enterpriseApi = 'webauthorapi';
                    service.config = {};

                    if (service.runOn.type === 'cloud') {
                        service.runOn.type = 'hub';
                    }
                    RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                        $http({
                            method: 'POST',
                            url: $scope.marketplaceURL + 'api/admin/v2/services/',
                            headers: {
                                'Authorization': token,
                                'timeout': $scope.timeout,
                                "Content-Type": "application/json"
                            },
                            data: JSON.stringify(service)
                        }).then(function (response) {
                            var retries = 3;
                            var enableService = function () {
                                $http({
                                    method: 'POST',
                                    url: $scope.marketplaceURL + 'api/admin/v2/services/' + service.name + "/enable",
                                    cache: false,
                                    headers: {
                                        'Authorization': token,
                                        'timeout': $scope.timeout
                                    }
                                }).then(function (response) {
                                    if (service.runOn.type === 'hub') {
                                        service.runOn.type = 'cloud';
                                    }
                                    $scope.services.push(service);
                                    $scope.newServiceName = '';
                                    $scope.runOn = null;

                                }, function (error) {
                                    if (retries-- > 0) {
                                        enableService();
                                    } else {
                                        baseErrorHandler.handleError(error, "An error occurred while enabling the service instance " + service.name, $scope.marketplaceURL);
                                    }
                                });
                            };
                            enableService();
                        }, function (error) {
                            baseErrorHandler.handleError(error, "An error occurred while creating the service instance " + service.name, $scope.marketplaceURL);
                        });
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
                    if (timeoutIsInvalid()) {
                        return;
                    }
                    RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                        $http({
                            method: 'POST',
                            url: $scope.marketplaceURL + 'api/admin/v2/services/' + service.name + "/disable",
                            cache: false,
                            headers: {
                                'Authorization': token,
                                'timeout': $scope.timeout
                            }
                        }).then(function (response) {
                            var retries = 3;
                            var deleteService = function() {
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

                var newServiceNameIsInvalid = function () {
                    if (!$scope.newServiceName) {
                        alert('Please specify the name of the new service');
                        return true;
                    }
                    if ($scope.newServiceName.toString().match(/^[-a-zA-Z0-9,&]+$/) == null) {
                        alert('New Service name must contain only alphanumeric characters');
                        return true;
                    }
                    var existingServiceWithSameName = $scope.services.filter(function(s) {
                        return s.name === $scope.newServiceName;
                    });
                    if (existingServiceWithSameName.length > 0) {
                        alert($scope.newServiceName + ' already exists. Please choose a different name');
                        return true;
                    }
                    return false;
                };

                var runOnIsInvalid = function() {
                    if (!$scope.runOn || typeof $scope.runOn !== 'object') {
                        alert('Please specify where the new service will run on');
                        return true;
                    }
                    return false;
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
    })
})();
'use strict';
require('angular');
require('angular-loading-bar');
var Site = require('../model/Site');

//TODO Refactor this class as it got too large and convoluted

module.exports = (function () {

    angular.module('KidoScraper').controller('RunController', function ($scope, $routeParams, $location, $http, RunInBackgroundScript, AngularScope) {
        console.log('Loading Run Controller...');

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

                    RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                        $http({
                            method: 'GET',
                            url: $scope.marketplaceURL + 'api/services',
                            headers: {'Authorization': token},
                            ignoreLoadingBar: true
                        }).then(function (response) {
                            if (response.data && typeof Array.isArray(response.data)) {
                                response.data = response.data.filter(function (service) {
                                    return service.enterpriseApi === 'webscraper';
                                });
                            }
                            $scope.services = response.data;
                            $scope.authRequired = false;

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
                                response.data.unshift({name: 'kidozen', type: 'cloud'});
                                $scope.agents = response.data;
                            }, function (error) {
                                alert(JSON.stringify(error, null, 2));
                                handleError(error, "Error while attempting to retrieve agents");
                            });

                        }, function (error) {
                            handleError(error, "Error while attempting to retrieve services");
                        });
                    });
                };
                $scope.createNewService = function () {
                    if (!$scope.newServiceName) {
                        alert('Please specify the name of the new service');
                        return;
                    }
                    if (!$scope.runOn || typeof $scope.runOn !== 'object') {
                        alert('Please specify where the new service will run on');
                        return;
                    }
                    var service = {};
                    service.name = $scope.newServiceName;
                    service.runOn = $scope.runOn;
                    service.enterpriseApi = 'webscraper';
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
                                    $scope.runOn = 'CADORNA';

                                }, function (error) {
                                    if (retries-- > 0) {
                                        enableService();
                                    } else {
                                        handleError(error, "An error occurred while enabling the service instance " + service.name);
                                    }
                                });
                            };
                            enableService();
                        }, function (error) {
                            handleError(error, "An error occurred while creating the service instance " + service.name);
                        });
                    });
                };
                $scope.deleteService = function (index) {
                    var service = $scope.services[index];

                    if (!service) {
                        alert("Could not determine the service to be deleted");
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
                                        handleError(error, "An error occurred while deleting the service instance " + service.name);
                                    }
                                });
                            };
                            deleteService();

                        }, function (error) {
                            handleError(error, "An error occurred while disabling the service instance " + service.name);
                        });
                    });
                };
                $scope.runIn = function (service) {
                    if (!service) {
                        alert("Could not determine the service to run the script with!");
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
                            data: {json: $scope.site}
                        }).then(function (response) {
                            if (response.status !== 200 || response.data.error) {
                                alert("The service invocation produced an error: " + response.statusText + " / " + JSON.stringify(response.data, null, 2));
                            } else {
                                $scope.executionResult = JSON.stringify(response.data, null, 2);
                            }
                            $scope.running = false;
                        }, function (error) {
                            handleError(error, "Error while invoking the method 'runJson'");
                            $scope.running = false;
                        });
                    });
                };
                $scope.runAgain = function () {
                    $scope.runIn($scope.lastUsedService);
                };

                $scope.back = function () {
                    $scope.executionResult = null;
                };

                var handleError = function (error, baseMessage) {
                    var msg = baseMessage;
                    if (error) {
                        if (error.status === 0) {
                            msg += "\n\nIs " + $scope.marketplaceURL + " up and running?\nAre SSL certs valid?";
                        } else {
                            msg += " (status code: " + error.status + ")";
                        }
                    }
                    alert(msg);
                }
            });
        });
    })
})()
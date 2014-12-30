'use strict';
require('angular');
require('angular-loading-bar');
var Site = require('../model/Site');

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
                                response.data = response.data.filter(function(service) {
                                   return service.enterpriseApi === 'webscraper';
                                });
                            }
                            $scope.services = response.data;
                            $scope.authRequired = false;
                        }, function (error) {
                            handleError(error, "Error while attempting to retrieve services");
                        });
                    });
                };
                $scope.createNewService = function () {
                    alert("To-Do: Create a new service");
                };
                $scope.runIn = function (service) {
                    if (!service) {
                        alert("Could not determine which service I have to run the script with!");
                        return;
                    }
                    $scope.lastUsedService = service;
                    $scope.running = true;

                    RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                        $http({
                            method: 'POST',
                            url: $scope.marketplaceURL + 'api/admin/services/' + service.name + '/invoke/runJson',
                            headers: {'Authorization': token, 'timeout': $scope.timeout, "Content-Type": "application/json"},
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

                var handleError = function(error, baseMessage) {
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
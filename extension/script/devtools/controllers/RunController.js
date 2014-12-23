'use strict';
require('angular');
var Site = require('../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('RunController', function ($scope, $routeParams, $location, $http, RunInBackgroundScript, AngularScope) {
        console.log('Loading Run Controller...');

        if (!$routeParams.name) {
            return $location.path('/');
        }
        $scope.timeout = 60; //default, can be changed by the user
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
                            headers: {'Authorization': token}
                        }).then(function (response) {
                            if (response.data && typeof Array.isArray(response.data)) {
                                response.data = response.data.filter(function(service) {
                                   return service.enterpriseApi === 'webscraper';
                                });
                            }
                            $scope.services = response.data;
                            $scope.authRequired = false;
                        }, function (error) {
                            alert("Error while attempting to retrieve services from " + $scope.marketplaceURL + ": " + JSON.stringify(error, null, 2));
                        });
                    });
                };
                $scope.createNewService = function () {
                    alert("To-Do: Create a new service");
                };
                $scope.runIn = function (service) {
                    var url = $scope.marketplaceURL + 'api/admin/services/' + service.name + '/invoke/runJson';

                    RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                        $http({
                            method: 'POST',
                            url: url,
                            headers: {'Authorization': token, 'timeout': $scope.timeout, "Content-Type": "application/json"},
                            data: {json: $scope.site}
                        }).then(function (response) {
                            if (response.status !== 200 || response.data.error) {
                                alert("The service invocation produced an error: " + response.statusText + " / " + JSON.stringify(response.data, null, 2));
                            } else {
                                $scope.executionResult = JSON.stringify(response.data, null, 2);
                            }
                        }, function (error) {
                            alert("Error while invoking the method 'runJson' in " + $scope.marketplaceURL + ": " + JSON.stringify(error, null, 2));
                        });
                    });
                };
            });
        });
    })
})()
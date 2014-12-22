'use strict';
require('angular');
var Site = require('../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('RunController', function ($scope, $routeParams, $location, $http, RunInBackgroundScript, AngularScope) {
        console.log('Loading Run Controller...');

        if (!$routeParams.name) {
            return $location.path('/');
        }
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
                        alert("The Marketplace URL is mandatory");
                        return;
                    }
                    //TODO Validate the presence of $scope.marketplaceURL and whether it is a valid URL and make it canonic so that we don't screw it up
                    RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                        $http({
                            method: 'GET',
                            url: $scope.marketplaceURL + '/api/services',
                            headers: {'Authorization': token}
                        }).then(function (response) {
                            $scope.services = response.data;
                            $scope.authRequired = false;
                        }, function (error) {
                            alert("Error while attempting to retrieve the services from " + $scope.marketplaceURL + ": " + JSON.stringify(error, null, 2));
                        });
                    });
                };
                $scope.createNewService = function () {
                    alert("TBC: Create a new service");
                };
                $scope.runIn = function (service) {
                    alert("TBC: Run in a service");
                };
            });
        });
    })
})();
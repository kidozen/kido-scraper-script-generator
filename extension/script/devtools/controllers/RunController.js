'use strict';
require('angular');
var Site = require('../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('RunController', function ($scope, $routeParams, $location, $http, RunInBackgroundScript, AngularScope) {
        console.log('Loading Run Controller...');

        if (!$routeParams.name) {
            return $location.path('/');
        }

        RunInBackgroundScript.getFromLocalStorage($routeParams.name).done(function (siteAsJson) {
            AngularScope.apply($scope, function () {
                $scope.site = siteAsJson;
                $scope.authRequired = true;
                $scope.authenticate = function () {
                    //TODO Validate the presence of $scope.marketplaceURL and whether it is a valid URL
                    RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                        alert("About to hit the services API with token = " + token);

                        $http({
                            method: 'GET',
                            url: 'https://contoso.local.kidozen.com/api/services',
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
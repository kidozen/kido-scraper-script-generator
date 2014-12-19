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
            });
        });

        //$http({
        //    method: 'GET',
        //    url: 'https://contoso.local.kidozen.com/api/services',
        //    headers: {'Authorization': "http%3A%2F%2Fschemas.kidozen.com%2Fdomain=kidozen.com&http%3A%2F%2Fschemas.xmlsoap.org%2Fws%2F2005%2F05%2Fidentity%2Fclaims%2Fname=Contoso%20Admin&http%3A%2F%2Fschemas.xmlsoap.org%2Fws%2F2005%2F05%2Fidentity%2Fclaims%2Femailaddress=contoso%40kidozen.com&http%3A%2F%2Fschemas.kidozen.com%2Fidentityprovider=https%3A%2F%2Fidentity.kidozen.com%2F&http%3A%2F%2Fschemas.kidozen.com%2Fuserid=706ad3a3c252b92ecc0251800f266981&http%3A%2F%2Fschemas.kidozen.com%2Fname=Contoso%20Admin&http%3A%2F%2Fschemas.kidozen.com%2Femail=contoso%40kidozen.com&http%3A%2F%2Fschemas.kidozen.com%2Fusersource=Admins%20(Kidozen)&http%3A%2F%2Fschemas.kidozen.com%2Frole=Application%20Center%20Admin&Audience=_marketplace&Issuer=http%3A%2F%2Fauth.kidozen.com%2F&ExpiresOn=1419013510&HMACSHA256=vzXJwa8xREHIeteO46bZb2hnMROq8DLMIP%2BlHMaXq3s%3D"}
        //}).then(function (response) {
        //    AngularScope.apply($scope, function () {
        //        $scope.services = response.data;
        //        $scope.authRequired = false;
        //    });
        //}, function (error) {
        //    alert("Error while attempting to retrieve the services from " + $scope.marketplaceURL + ": " + JSON.stringify(error, null, 2));
        //});

        $scope.authenticate = function () {
            //TODO Validate the presence of $scope.marketplaceURL and whether it is a valid URL
            RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                alert("About to hit the services API with token = " + token);

                $http({
                    method: 'GET',
                    url: 'https://contoso.local.kidozen.com/api/services',
                    headers: {'Authorization': token}
                }).then(function (response) {
                    AngularScope.apply($scope, function () {
                        $scope.services = response.data;
                        $scope.authRequired = false;
                    });
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
    })
})();
'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper').controller('ZeroController', function ($scope, $location, RunInBackgroundScript, AngularScope) {
        console.log('Loading Zero Controller...');
        RunInBackgroundScript.getFromLocalStorage(null).done(function(allSites) {
            AngularScope.apply($scope,  function () {
                $scope.sites = allSites;
                $scope.appcenter = '';

                $scope.addNewSite = function () {
                    $location.path('/one');
                };
                $scope.open = function (site) {
                    $location.path('/two/' + site.name);
                };
                $scope.configure = function () {
                    RunInBackgroundScript.getAuthToken().done(function (token) {

                        AngularScope.apply($scope, function () {
                            alert("Retrieved token: " + token);
                        });
                    });
                };
            });
        })
    })
})();
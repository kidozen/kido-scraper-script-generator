'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper').controller('ZeroController', function ($scope, $location, RunInBackgroundScript, AngularScope) {
        console.log('Loading Zero Controller...');

        RunInBackgroundScript.getFromLocalStorage(null).done(function(allSites) {
            AngularScope.apply($scope, function () {
                $scope.sites = allSites;
                $scope.appcenter = '';

                $scope.addNewSite = function () {
                    $location.path('/one');
                };
                $scope.deleteSite = function (index) {
                    RunInBackgroundScript.deleteFromLocalStorage($scope.sites[index].name).done(function() {
                        AngularScope.apply($scope, function () {
                            $scope.sites.splice(index, 1);
                        });
                    });
                };
                $scope.open = function (site) {
                    $location.path('/two/' + site.name);
                };
            });
        });
    })
})();
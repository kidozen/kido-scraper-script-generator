'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper').controller('ProjectController', function ($scope, $location, RunInBackgroundScript, AngularScope) {
        console.log('Loading Project Controller...');

        RunInBackgroundScript.getFromLocalStorage(null).done(function(allSites) {
            AngularScope.apply($scope, function () {
                $scope.sites = allSites;
                $scope.appcenter = '';

                $scope.addNewSite = function () {
                    $location.path('/one');
                };
                $scope.deleteSite = function (index) {
                    var siteName = $scope.sites[index].name;

                    if (!confirm("Are you sure you want to delete the site '" + siteName + "'?")) {
                        return;
                    }
                    RunInBackgroundScript.deleteFromLocalStorage(siteName).done(function() {
                        AngularScope.apply($scope, function () {
                            $scope.sites.splice(index, 1);
                        });
                    });
                };
                $scope.openSite = function (site) {
                    $location.path('/two/' + site.name);
                };
                $scope.exportSite = function (site) {
                    $location.path('/export/' + site.name);
                };
                $scope.runSite = function (site) {
                    $location.path('/run/' + site.name);
                };
            });
        });
    })
})();
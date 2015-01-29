'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper').controller('ListProjectsController', function ($scope, $location, RunInBackgroundScript, AngularScope) {
        console.log('Loading ListProjects Controller...');

        RunInBackgroundScript.getFromLocalStorage(null).done(function(allSites) {
            AngularScope.apply($scope, function () {
                $scope.sites = allSites;
                $scope.appcenter = '';

                $scope.createNewProject = function () {
                    $location.path('/projects/create');
                };
                $scope.deleteProject = function (index) {
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
                $scope.openProjectDetails = function (site) {
                    $location.path('/projects/' + site.name);
                };
                $scope.exportProject = function (site) {
                    $location.path('/projects/export/' + site.name);
                };
                $scope.runProject = function (site) {
                    $location.path('/projects/run/' + site.name);
                };
            });
        });
    });
})();
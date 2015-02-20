'use strict';
require('angular');
require('../../services/AngularScope');

module.exports = (function () {

    angular.module('KidoScraper').controller('ProjectListController', function ($scope, $location, RunInBackgroundScript, AngularScope) {
        console.log('Loading Project List Controller...');

        RunInBackgroundScript.getFromLocalStorage(null).done(function(allSites) {
            AngularScope.apply($scope, function () {
                $scope.sites = allSites;

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
                    $location.path('/projects/' + site.name + "/export");
                };
                $scope.runProject = function (site) {
                    if (!site.steps || site.steps.length == 0) {
                        return alert("Cannot run the service without at least one scraping step!");
                    }
                    $location.path('/projects/' + site.name + "/run");
                };
            });
        });
    });
})();
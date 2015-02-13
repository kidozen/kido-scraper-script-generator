'use strict';
require('angular');
var Site = require('../../model/Site');
var _ = require('lodash');

module.exports = (function () {

    angular.module('KidoScraper').controller('ProjectCreateOrEditController', function ($scope, $routeParams, $location, RunInBackgroundScript, AngularScope) {
        console.log('Loading Project Create or Edit Controller...');

        $scope.editMode = $routeParams.name != null;
        $scope.useBasicAuth = false;

        if ($scope.editMode) {
            RunInBackgroundScript.getFromLocalStorage($routeParams.name).done(function(siteAsJson) {
                AngularScope.apply($scope, function () {
                    $scope.site = siteAsJson;
                    $scope.useBasicAuth = !_.isEmpty($scope.site.credentials);

                    emptyCredentialsBasedOnCheckboxValue();
                });
            });
        } else {
            $scope.site = Site.getDefaults();
            RunInBackgroundScript
                .getCurrentPageDetails()
                .done(function (currentPageDetails) {
                    AngularScope.apply($scope, function () {
                        $scope.site.name = currentPageDetails ? currentPageDetails.title : '';
                        $scope.site.url = currentPageDetails ? currentPageDetails.url : '';
                        $scope.useBasicAuth = false;

                        emptyCredentialsBasedOnCheckboxValue();
                    });
                }
            );
        }

        $scope.create = function () {
            $scope.site.name = $scope.site.name ? $scope.site.name.toLowerCase() : '';

            try {
                Site.validate($scope.site);
            } catch (err) {
                return alert(err);
            }
            var originalProjectName = $routeParams.name;
            var projectNameWasChanged = $scope.editMode && originalProjectName != $scope.site.name;

            if (!$scope.editMode || projectNameWasChanged) {
                RunInBackgroundScript.getFromLocalStorage($scope.site.name).done(function (existingSite) {
                    AngularScope.apply($scope, function () {
                        if (existingSite) {
                            return alert('$scope.site.name is already in use. Please choose a different one');
                        }
                        if (projectNameWasChanged) {
                            RunInBackgroundScript.deleteFromLocalStorage(originalProjectName);
                        }
                        saveProjectInLocalStorage();
                    });
                });
            } else {
                saveProjectInLocalStorage();
            }
        };

        $scope.extractSiteDetailsFromCurrentTab = function () {
            RunInBackgroundScript.getCurrentPageDetails().done(function (currentPageDetails) {
                AngularScope.apply($scope, function () {
                    $scope.site.name = currentPageDetails ? currentPageDetails.title : '';
                    $scope.site.url = currentPageDetails ? currentPageDetails.url : '';
                });
            });
        };

        $scope.openSiteURLInCurrentTab = function () {
            if (!$scope.site.url) {
                return alert("The Site's URL is required");
            }
            RunInBackgroundScript.loadURLInCurrentTab($scope.site.url);
        };

        $scope.cancel = function () {
            $scope.site.name = '';
            $scope.site.url = '';
            return $location.path('/projects');
        };

        function emptyCredentialsBasedOnCheckboxValue() {
            // empty credentials object every time the checkbox gets unchecked
            $scope.$watch('useBasicAuth', function (enabled) {
                if (!enabled) {
                    $scope.site.credentials = {};
                }
            });
        }

        function saveProjectInLocalStorage() {
            RunInBackgroundScript.setInLocalStorage({
                key: $scope.site.name,
                value: new Site($scope.site).toJson()
            }).done(function () {
                AngularScope.apply($scope, function () {
                    $location.path('/projects/' + $scope.site.name);
                });
            });
        }
    });
})();
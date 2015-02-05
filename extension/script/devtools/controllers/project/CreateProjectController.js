'use strict';
require('angular');
var Site = require('../../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('CreateProjectController', function ($scope, $location, RunInBackgroundScript, AngularScope) {
        console.log('Loading Create Project Controller...');

        RunInBackgroundScript
            .getCurrentPageDetails()
            .done(function (currentPageDetails) {

                AngularScope.apply($scope, function () {
                    $scope.name = currentPageDetails ? currentPageDetails.title : '';
                    $scope.url = currentPageDetails ? currentPageDetails.url : '';
                    $scope.useBasicAuth = false;
                    $scope.credentials = {};

                    // empty credentials object every time the checkbox gets unchecked
                    $scope.$watch('useBasicAuth', function (enabled) {
                        if (!enabled) {
                            $scope.credentials = {};
                        }
                    });
                });
            }
        );

        $scope.create = function () {
            $scope.name = $scope.name ? $scope.name.toLowerCase() : '';
            if (!$scope.name || !$scope.url) {
                return alert('name and url are required');
            }
            RunInBackgroundScript.getFromLocalStorage($scope.name).done(function (existingSite) {

                AngularScope.apply($scope, function () {
                    if (existingSite) {
                        return alert('name already in use');
                    }
                    var site = Site.getDefaults();
                    site.name = $scope.name;
                    site.url = $scope.url;
                    site.credentials = $scope.credentials;

                    RunInBackgroundScript.setInLocalStorage({
                        key: $scope.name,
                        value: new Site(site).toJson()
                    }).done(function () {
                        AngularScope.apply($scope, function () {
                            $location.path('/projects/' + $scope.name);
                        });
                    });
                });
            });
        };

        $scope.extractSiteDetailsFromCurrentTab = function () {
            RunInBackgroundScript.getCurrentPageDetails().done(function (currentPageDetails) {
                AngularScope.apply($scope, function () {
                    $scope.name = currentPageDetails ? currentPageDetails.title : '';
                    $scope.url = currentPageDetails ? currentPageDetails.url : '';
                });
            });
        };

        $scope.openSiteURLInCurrentTab = function () {
            if (!$scope.url) {
                return alert('The URL is required');
            }
            RunInBackgroundScript.loadURLInCurrentTab($scope.url);
        };

        $scope.cancel = function () {
            $scope.name = '';
            $scope.url = '';
            return $location.path('/projects');
        };
    });
})();
'use strict';
require('angular');
var Site = require('../../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('CreateProjectController', function ($scope, $location, RunInBackgroundScript, RunInCurrentTabContext, AngularScope) {
        console.log('Loading Create Project Controller...');

        RunInCurrentTabContext
            .getCurrentPageDetails()
            .done(function (currentPageDetails) {

                AngularScope.apply($scope, function () {
                    $scope.name = currentPageDetails ? currentPageDetails.title : '';
                    $scope.url = currentPageDetails ? currentPageDetails.url: '';

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
                });
            }
        );
        $scope.cancel = function () {
            $scope.name = '';
            $scope.url = '';
            return $location.path('/projects');
        };
    })
})
();
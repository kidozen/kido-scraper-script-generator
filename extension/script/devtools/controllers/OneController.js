'use strict';
require('angular');
var Site = require('../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('OneController', function ($scope, $location, RunInBackgroundScript, RunInCurrentTabContext, AngularScope) {
        console.log('Loading One Controller...');

        RunInCurrentTabContext
            .getCurrentPageDetails()
            .done(function (currentPageDetails) {

                if (currentPageDetails) {
                    AngularScope.apply($scope, function () {
                        $scope.name = currentPageDetails.title;
                        $scope.url = currentPageDetails.url;

                        $scope.create = function () {
                            $scope.name = $scope.name ? $scope.name.toLowerCase() : '';
                            if (!$scope.name || !$scope.url) {
                                return window.alert('name and url are required');
                            }
                            RunInBackgroundScript.getFromLocalStorage($scope.name).done(function (existingSite) {

                                AngularScope.apply($scope, function () {
                                    if (existingSite) {
                                        return window.alert('name already in use');
                                    }
                                    var site = Site.getDefaults();
                                    site.name = $scope.name;
                                    site.url = $scope.url;

                                    RunInBackgroundScript.setInLocalStorage({
                                        key: $scope.name,
                                        value: new Site(site).toJson()
                                    }).done(function () {
                                        AngularScope.apply($scope, function () {
                                            $location.path('/two/' + $scope.name);
                                        });
                                    });
                                });
                            });
                        };
                        $scope.cancel = function () {
                            $scope.name = '';
                            $scope.url = '';
                            return $location.path('/');
                        };
                    });
                }
            });
    })
})
();
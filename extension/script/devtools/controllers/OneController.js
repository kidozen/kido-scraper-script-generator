'use strict';
require('angular');
var Site = require('../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('OneController', function ($scope, $location, KidoStorage, RunInCurrentTabContext) {
        console.log('Loading One Controller...');
        RunInCurrentTabContext
            .getCurrentPageDetails()
            .done(function (currentPageDetails) {
                if (currentPageDetails) {
                    var updateNameAndUrlWithCurrentPageData = function () {
                        $scope.name = currentPageDetails.title;
                        $scope.url = currentPageDetails.url;
                    };
                    var runningAsAnExtension = chrome && chrome.devtools;

                    if (runningAsAnExtension) {
                        $scope.$apply(updateNameAndUrlWithCurrentPageData);
                    } else {
                        updateNameAndUrlWithCurrentPageData();
                    }
                }
            });

        $scope.create = function () {
            $scope.name = $scope.name ? $scope.name.toLowerCase() : '';
            if (!$scope.name || !$scope.url) {
                return window.alert('name and url are required');
            }
            if (KidoStorage.get($scope.name)) {
                return window.alert('name already in use');
            }
            var site = Site.getDefaults();
            site.name = $scope.name;
            site.url = $scope.url;
            KidoStorage.store($scope.name, site);
            $location.path('/two/' + $scope.name);
        };
        $scope.cancel = function () {
            $scope.name = '';
            $scope.url = '';
            return $location.path('/');
        };
    })
})();
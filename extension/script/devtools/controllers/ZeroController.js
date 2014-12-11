'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper').controller('ZeroController', function ($scope, $location, KidoStorage, RunInBackgroundScript) {
        console.log('Loading Zero Controller...');
        $scope.sites = KidoStorage.get() || [];
        $scope.appcenter = '';
        $scope.addNewSite = function () {
            $location.path('/one');
        };
        $scope.open = function (site) {
            $location.path('/two/' + site.name);
        };
        $scope.configure = function () {
            RunInBackgroundScript.getAuthToken().done(function (token) {

                var doSomethingWithToken = function () {
                    alert("From ZeroController, token: " + token);
                };
                var runningAsAnExtension = chrome && chrome.devtools;

                if (runningAsAnExtension) {
                    $scope.$apply(doSomethingWithToken);
                } else {
                    doSomethingWithToken();
                }
            });
        };
    })
})();
'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper').controller('ZeroController', function ($scope, $location, kidoStorage, auth) {
        console.log('Loading Zero Controller...');

        kidoStorage.get(null).then(function (allSites) {
            alert('[ZeroController] Got allSites = ' + allSites);

            $scope.sites = allSites || [];
            $scope.appcenter = '';

            //TODO See if we can move this outside of the callback
            $scope.addNewSite = function () {
                $location.path('/one');
            };
            $scope.open = function (site) {
                $location.path('/two/' + site.name);
            };
            $scope.configure = function () {
                auth.getAuthToken().then(function (token) {
                    var doSomethingWithToken = function () {
                        alert("From ZeroController, token: " + JSON.stringify(token, null, 2));
                    };

                    //TODO Reify this behaviour in an object that we can reuse across controllers
                    var runningAsAnExtension = chrome && chrome.devtools;

                    if (runningAsAnExtension) {
                        $scope.$apply(doSomethingWithToken);
                    } else {
                        doSomethingWithToken();
                    }
                });
            };
        });
    })
})();
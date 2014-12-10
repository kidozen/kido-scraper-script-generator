'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper').controller('ZeroController', function ($scope, $location, KidoStorage) {
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
            var tab,
                count = 0,
                timeout = 60,
                prefix = 'Success payload=';

            if (chrome && chrome.tabs) {
                console.log("Chrome tabs are present!");
                chrome.tabs.create({url: "https://auth-qa.kidozen.com/v1/armonia/sign-in?wtrealm=_marketplace&wreply=urn-ietf-wg-oauth-2.0-oob&wa=wsignin1.0"}, function (t) {
                    tab = t;
                });
            }
            function poll() {
                if ((tab && tab.title || '').indexOf(prefix) === 0) {
                    var token = tab.title.substr(prefix.length);
                    saveToken(token);
                    return;
                }
                if (count > timeout) {
                    alert('fail!');
                    return;
                }
                count++;
                setInterval(poll, 1000);
            }

            function saveToken(token) {
                console.log(token);
            }

            if (chrome && chrome.tabs) {
                poll()
            }
        };
    })
})();
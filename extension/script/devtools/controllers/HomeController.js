'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper').controller('HomeController', function ($scope, $location, sessionService) {
        console.log('Loading Home Controller...');

        alert("[HomeController] attempt to retrieve existing credentials...");

        sessionService.getSessionDetails(null, function (error, session) {
            if (error) return;

            $scope.authenticated = session && session.token && session.marketplaceURL;

            alert("[HomeController] Set " + JSON.stringify($scope.authenticated));
        });
    });
})();
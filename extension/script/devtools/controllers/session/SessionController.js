'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper').controller('SessionController', function ($scope, $location, sessionService) {
        console.log('Loading Session Controller...');

        // attempt to retrieve existing credentials...
        alert("[SessionController] attempt to retrieve existing credentials...");

        redirectToHomeIfUserIsAuthenticated(null);

        $scope.authenticate = function () {
            alert("Invoked authenticate with " + $scope.marketplaceURL);
            if (!$scope.marketplaceURL) {
                alert("The Marketplace URL is required");
                return;
            }
            // Standardize all marketplace URLs to have a trailing slash
            $scope.marketplaceURL = $scope.marketplaceURL.replace(/\/?$/, '/');

            redirectToHomeIfUserIsAuthenticated($scope.marketplaceURL);
        };

        function redirectToHomeIfUserIsAuthenticated(marketplaceURL) {
            sessionService.getSessionDetails(marketplaceURL, function (error, session) {
                if (error) return;
                if (session && session.token && session.marketplaceURL) {
                    alert("[SessionController] Auth details found...redirecting to /home...");
                    return $location.path('/home');
                }
            });
        }
    });
})();
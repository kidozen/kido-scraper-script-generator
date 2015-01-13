'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper')
        .service('serviceService', function ($http, RunInBackgroundScript) {

            // TODO The marketplaceURL should be provided by a service that knows the current auth details
            var getAllServices = function (marketplaceURL, cb) {
                RunInBackgroundScript.getAuthToken(marketplaceURL).done(function (token) {
                    $http({
                        method: 'GET',
                        url: marketplaceURL + 'api/services',
                        headers: {'Authorization': token},
                        ignoreLoadingBar: true
                    }).then(function (response) {
                        cb(null, response.data);
                    }, function (err) {
                        cb(Error.create("An error occurred while retrieving existing services", err), null);
                    });
                });
            };

            return {
                getAllServices: getAllServices
            };
        }
    );
})();

'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper')
        .service('sessionService', function ($http, RunInBackgroundScript) {

            var getSessionDetails = function (marketplaceURL, cb) {

                if (marketplaceURL) {
                    alert("Attempting to get token for " + marketplaceURL);
                    RunInBackgroundScript.getAuthToken(marketplaceURL).done(function (token) {
                        alert("About to invoke the callback with proper credentials...");
                        return cb(null, {marketplaceURL: marketplaceURL, token: token});
                    });
                } else {
                    alert("About to attempt to get the lastUsedMarketplaceURL...");

                    RunInBackgroundScript.getFromLocalStorage(RunInBackgroundScript.lastUsedMarketplaceURL).done(function (lastUsedMarketplaceURL) {
                        if (!lastUsedMarketplaceURL) {
                            return cb(null, null);
                        }
                        RunInBackgroundScript.getAuthToken(lastUsedMarketplaceURL).done(function (token) {
                            alert("About to invoke the callback with credentials taken from lastUsedMarketplaceURL...");
                            return cb(null, {marketplaceURL: lastUsedMarketplaceURL, token: token});
                        });
                    });
                }
            };

            return {
                getSessionDetails: getSessionDetails
            };
        }
    );
})();

'use strict';
require('angular');

var kidoScraper = require('../KidoScraper');
var _ = require('lodash');

require('../services/RunInBackgroundScript');
require('../services/AngularScope');

module.exports = (function () {

    kidoScraper.directive('breadcrumb', function (RunInBackgroundScript, AngularScope, breadcrumbs) {
        return {
            restrict: 'E',
            scope: {
                replacements: '='
            },
            templateUrl: 'partial/breadcrumb.html',
            link: function (scope, elem, attrs) {
                // We use this mechanism especially because the "with" attribute might contain interpolated values
                // that are undefined during the linking stage of this directive.
                //attrs.$observe('replace', function(key) {
                //    if (key) {
                //        attrs.$observe('with', function(value) {
                //            if (value) {
                //              var dynamicLabels = {};
                //              dynamicLabels[key] = value;
                //              scope.breadcrumbs = breadcrumbs.get(dynamicLabels);
                //            }
                //        });
                //    }
                //});
                scope.breadcrumbs = breadcrumbs.get(scope.replacements);
                scope.loggedInTo = undefined;

                var bgScript = RunInBackgroundScript;

                bgScript.getFromLocalStorage(bgScript.lastUsedMarketplaceURL).done(function (lastUsedMarketplaceURL) {
                    if (lastUsedMarketplaceURL) {
                        bgScript.getAuthTokenKeyInLocalStorageFor(lastUsedMarketplaceURL).done(function(tokenKey) {
                            bgScript.getFromLocalStorage(tokenKey).done(function (authToken) {
                                if (authToken) {
                                    AngularScope.apply(scope, function () {
                                        scope.loggedInTo = lastUsedMarketplaceURL;
                                    });
                                }
                            });
                        });
                    }
                });

                scope.logout = function () {
                    if (!scope.loggedInTo) {
                        alert("Unable to logout the user as the Marketplace URL could not be detected");
                        return;
                    }
                    bgScript.getAuthTokenKeyInLocalStorageFor(scope.loggedInTo).done(function(tokenKey) {
                        bgScript.deleteFromLocalStorage(tokenKey).done(function () {
                            AngularScope.apply(scope, function () {
                                scope.loggedInTo = undefined;
                            });
                        });
                    });
                };
            }
        };
    });
})();
'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper')
        .service('AngularScope', function (/*runningAsAnExtension*/) {
            var service = {};

            // This enables the Chrome extension to work also as a simple web app (for testing)
            service.apply = function(scope, aFunction) {
                if (chrome && (chrome.devtools || chrome.tabs)) {
                    scope.$apply(aFunction);
                } else {
                    aFunction();
                }
            };
            return service;
        }
    );
})();

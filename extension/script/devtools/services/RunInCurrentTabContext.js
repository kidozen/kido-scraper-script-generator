'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper')
        .service('RunInCurrentTabContext', function () {
            // This enables the Chrome extension to work also as a simple web app (for testing)
            var haveToProxyCallsToInspectedPage = chrome && chrome.devtools;

            return getContentScript(haveToProxyCallsToInspectedPage ? "DevTools" : "ContentScript");
        }
    );
})();

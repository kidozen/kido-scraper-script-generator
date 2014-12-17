'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper')
        .service('RunInCurrentTabContext', function () {
            return getContentScript(chrome && chrome.devtools ? "DevTools" : (chrome && chrome.tabs ? "BackgroundScript" : "ContentScript"));
        }
    );
})();

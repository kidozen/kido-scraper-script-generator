'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper')
        .service('RunInCurrentTabContext', function () {
            return getContentScript(chrome && !chrome.tabs ? (chrome && chrome.storage ? "DevTools" : "ContentScript") : "BackgroundScript");
        }
    );
})();

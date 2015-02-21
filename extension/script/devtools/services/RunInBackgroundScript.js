'use strict';
require('angular');

var kidoScraper = require('../KidoScraper');

module.exports = (function () {

    kidoScraper.service('RunInBackgroundScript', function () {
            return getBackgroundScript(chrome && !chrome.tabs  ? (chrome && chrome.storage ? "DevTools"
                                                                                           : "ContentScript")
                                                               : "BackgroundScript");
        }
    );
})();

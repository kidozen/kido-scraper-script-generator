'use strict';
require('angular');

var kidoScraper = require('../KidoScraper');

module.exports = (function () {

    kidoScraper.service('RunInCurrentTabContext', function () {
            return getContentScript(chrome && !chrome.tabs  ? (chrome && chrome.storage ? "DevTools"
                                                                                        : "ContentScript")
                                                            : "BackgroundScript");
        }
    );
})();

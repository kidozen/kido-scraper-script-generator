'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper')
        .service('RunInBackgroundScript', function () {
            return getBackgroundScript(chrome && chrome.devtools ? "DevTools" : "ContentScript");
        }
    );
})();

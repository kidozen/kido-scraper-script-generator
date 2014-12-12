'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper')
        .service('RuntimeEnvironment', function () {
            return {
                runningAsAnExtension: function() {
                    return chrome && chrome.devtools;
                },
                apply: function(aFunction, scope) {

                    if (this.runningAsAnExtension()) {
                        scope.$apply(aFunction);
                    } else {
                        aFunction();
                    }
                }
            };
        }
    );
})();

'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper')
        .service('baseErrorHandler', function () {
            var handleError = function (error, baseMessage, marketplaceURL) {
                var msg = baseMessage;
                if (error) {
                    if (error.status === 0) {
                        msg += "\n\nIs " + marketplaceURL + " up and running?\nAre SSL certs valid?";
                    } else {
                        msg += " (status code: " + error.status + ")";
                    }
                }
                alert(msg);
            };

            return {
                handleError: handleError
            };
        }
    );
})();

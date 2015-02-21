'use strict';
require('angular');

var kidoScraper = require('../KidoScraper');

module.exports = (function () {

    kidoScraper.service('baseErrorHandler', function () {
            var handleError = function (error, baseMessage, marketplaceURL, dealWithNonRestErrors) {
                var msg = baseMessage;
                if (error && error.status != null) {
                    if (error.status === 0) {
                        msg += "\n\nIs " + marketplaceURL + " up and running?\nAre SSL certs valid?";
                    } else {
                        msg += " (status code: " + error.status + ")";
                    }
                } else {
                    if (!dealWithNonRestErrors) return;
                    if (error instanceof Error) {
                        msg = error.message;
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

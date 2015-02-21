'use strict';
require('angular');

var kidoScraper = require('../KidoScraper');

kidoScraper.directive("regexpMatching", function () {

    var regexp;
    return {
        restrict: "A",
        link: function (scope, elem, attrs) {
            regexp = eval(attrs.regexpMatching);

            var char;
            elem.on("keypress", function (event) {
                char = String.fromCharCode(event.which);
                if (!regexp.test(elem.val() + char))
                    event.preventDefault();
            });
        }
    };
});
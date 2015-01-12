'use strict';
require('angular');

angular.module('KidoScraper').directive("regexpMatching", function () {

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
            })
        }
    }
});
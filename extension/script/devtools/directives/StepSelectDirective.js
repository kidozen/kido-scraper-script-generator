'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper').directive('stepSelect', function (RunInCurrentTabContext, AngularScope) {
        return {
            restrict: 'E',
            scope: {
                currentStep: '='
            },
            templateUrl: 'partial/step_select.html',
            link: function (scope) {
                if (!scope.currentStep) throw 'stepSelect directive needs a currentStep to work with';

                scope.selectSelector = function () {
                    RunInCurrentTabContext
                        .selectSelector({parentCSSSelector: "", allowedElements: "*"})
                        .done(function (retrievedCssSelector) {
                            AngularScope.apply(scope, function () {
                                scope.currentStep.key = retrievedCssSelector.CSSSelector;
                            });
                        });
                };
            }
        };
    });
})();
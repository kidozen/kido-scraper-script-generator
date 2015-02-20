'use strict';
require('angular');
require('../services/AngularScope');

module.exports = (function () {

    angular.module('KidoScraper').directive('stepClick', function (RunInCurrentTabContext, AngularScope) {
        return {
            restrict: 'E',
            scope: {
                currentStep: '='
            },
            templateUrl: 'partial/step_click.html',
            link: function (scope) {
                if (!scope.currentStep) throw 'stepClick directive needs a currentStep to work with';

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
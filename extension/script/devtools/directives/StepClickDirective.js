'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper').directive('stepClick', function (RunInCurrentTabContext) {
        return {
            restrict: 'E',
            scope: {
                currentStep: '='
            },
            templateUrl: 'partial/step_click.html',
            link: function (scope) {
                alert("scope.currentStep = " + scope.currentStep);
                if (!scope.currentStep) throw 'stepClick directive needs a currentStep to work with';

                scope.selectSelector = function () {
                    alert("About to select CSS selector...");
                    RunInCurrentTabContext
                        .selectSelector({parentCSSSelector: "", allowedElements: "*"})
                        .done(function (retrievedCssSelector) {
                            alert(retrievedCssSelector.CSSSelector);
                            scope.$apply(function () {
                                scope.currentStep.key = retrievedCssSelector.CSSSelector;
                                alert("scope.currentStep.key = " + scope.currentStep.key);
                            });
                        });
                };
            }
        };
    })
})();
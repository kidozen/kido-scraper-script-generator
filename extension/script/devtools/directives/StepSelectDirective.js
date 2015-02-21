'use strict';
require('angular');

var kidoScraper = require('../KidoScraper');

require('../services/RunInCurrentTabContext');
require('../services/AngularScope');

module.exports = (function () {

    kidoScraper.directive('stepSelect', function (RunInCurrentTabContext, AngularScope) {
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
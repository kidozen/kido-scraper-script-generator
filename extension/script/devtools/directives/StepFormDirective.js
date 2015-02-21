'use strict';
require('angular');

var kidoScraper = require('../KidoScraper');
var Site = require('../model/Site');

require('../services/RunInCurrentTabContext');
require('../services/AngularScope');

module.exports = (function () {

    kidoScraper.directive('stepForm', function (RunInCurrentTabContext, AngularScope) {
        return {
            restrict: 'E',
            scope: {
                currentStep: '='
            },
            templateUrl: 'partial/step_form.html',
            link: function (scope) {
                if (!scope.currentStep) throw 'stepForm directive needs a currentStep to work with';

                //scope.validParamTypes = ['string', 'number', 'boolean', 'array', 'object', 'userEmail', 'claim', 'timestamp'];

                scope.addSelector = function () {
                    scope.currentStep.selectors.push(Site.getDefaults(Site.TYPES.FORM_SELECTOR));
                };
                scope.selectSelector = function (index) {
                    RunInCurrentTabContext
                        .selectSelector({parentCSSSelector: "", allowedElements: "*"})
                        .done(function (retrievedCssSelector) {
                            AngularScope.apply(scope, function () {
                                if (index === -1) {
                                    scope.currentStep.submit.key = retrievedCssSelector.CSSSelector;
                                } else {
                                    scope.currentStep.selectors[index].key = retrievedCssSelector.CSSSelector;
                                }
                            });
                        });
                };
                scope.removeSelector = function (index) {
                    scope.currentStep.selectors.splice(index, 1);
                };
            }
        };
    });
})();
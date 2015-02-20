'use strict';
require('angular');
require('../services/AngularScope');
var Site = require('../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').directive('stepScrape', function (RunInCurrentTabContext, AngularScope) {
        return {
            restrict: 'E',
            scope: {
                currentStep: '='
            },
            templateUrl: 'partial/step_scrape.html',
            link: function (scope) {
                if (!scope.currentStep) throw 'stepScrape directive needs a currentStep to work with';
                var ATTRS = Site.getConstructor(Site.TYPES.SELECTOR).ATTRS;
                scope.attrs = [{
                    id: ATTRS.TEXT,
                    name: 'Text'
                }];
                // FIXME -- Known-bug: After the second time a user reaches the page rendered by this directive,
                // FIXME -- the checkbox is not checked because scope.scrapeWithinContainer is undefined
                scope.scrapeWithinContainer = (scope.currentStep.container && scope.currentStep.container.length > 0);

                // blank container property every time the checkbox gets unchecked
                scope.$watch('scrapeWithinContainer', function (enabled) {
                    if (!enabled) {
                        scope.currentStep.container = '';
                    }
                });
                scope.addField = function () {
                    scope.currentStep.fields.push(Site.getDefaults(Site.TYPES.SELECTOR));
                };
                scope.selectContainer = function () {
                    RunInCurrentTabContext
                        .selectSelector({parentCSSSelector: "", allowedElements: "*"})
                        .done(function (retrievedCssSelector) {
                            AngularScope.apply(scope, function () {
                                scope.currentStep.container = retrievedCssSelector.CSSSelector;
                            });
                        });
                };
                scope.selectSelector = function (index) {
                    RunInCurrentTabContext
                        .selectSelector({parentCSSSelector: "", allowedElements: "*"})
                        .done(function (retrievedCssSelector) {
                            AngularScope.apply(scope, function () {
                                scope.currentStep.fields[index].key = retrievedCssSelector.CSSSelector;
                            });
                        });
                };
                scope.removeField = function (index) {
                    scope.currentStep.fields.splice(index, 1);
                };
            }
        };
    })
})();
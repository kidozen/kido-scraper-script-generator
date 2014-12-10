'use strict';
require('angular');

var Site = require('../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').directive('stepScrape', function (RunInCurrentTabContext) {
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
                scope.addField = function () {
                    scope.currentStep.fields.push(Site.getDefaults(Site.TYPES.SELECTOR));
                };
                scope.selectSelector = function (index) {
                    console.log("Selecting selector for index " + index);
                    console.log(JSON.stringify(scope.currentStep.fields));
                    RunInCurrentTabContext
                        .selectSelector({parentCSSSelector: "", allowedElements: "*"})
                        .done(
                        function (retrievedCssSelector) {
                            scope.$apply(function () {
                                scope.currentStep.fields[index].key = retrievedCssSelector.CSSSelector;
                            });
                        }
                    );
                };
                scope.removeField = function (index) {
                    scope.currentStep.fields.splice(index, 1);
                };
            }
        };
    })
})();
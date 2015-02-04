'use strict';
require('angular');

var Site = require('../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').directive('select2', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                $(element).select2();

                // This is a hack to make select2 aware of the changes in the model when using it alongside ng-options.
                scope.$watch('runOn', function (newValue) {
                    if (newValue == null) {
                        $(element).select2("val", newValue);
                    }
                });
                //scope.$watch('selectedServiceName', function (newValue, oldValue) {
                //    $(element).select2().initSelection();
                //    $(element).select2("val", newValue);
                //    $(element).trigger('input');
                //    $(element).trigger('change');
                //    ngModel.$setViewValue(newValue);
                //    ngModel.$render();
                //    scope.$apply();
                //});
            }
        };
    });
})();
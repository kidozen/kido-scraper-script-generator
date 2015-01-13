'use strict';
require('angular');
var Site = require('../../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('ThreeController', function ($scope, $routeParams, $location, RunInBackgroundScript, AngularScope) {
        console.log('Loading Three Controller...');

        if (!$routeParams.name || !$routeParams.type) {
            return $location.path('/');
        }
        RunInBackgroundScript.getFromLocalStorage($routeParams.name).done(function (siteAsJson) {
            AngularScope.apply($scope, function () {
                $scope.site = siteAsJson;
            });
        });
        $scope.currentStep = Site.getDefaults($routeParams.type);
        $scope.isForm = $scope.currentStep.type === Site.TYPES.FORM;
        $scope.isClick = $scope.currentStep.type === Site.TYPES.CLICK;
        $scope.isScrape = $scope.currentStep.type === Site.TYPES.SCRAPE;

        $scope.submit = function () {
            try {
                Site.validateStep($scope.currentStep);
            } catch (exception) {
                return alert(exception.toString());
            }
            if (!$scope.site) {
                alert("$scope.site is required!");
                return;
            }
            $scope.site.steps.push($scope.currentStep);

            RunInBackgroundScript.setInLocalStorage({
                key: $routeParams.name, value: new Site($scope.site).toJson()
            }).done(function () {
                AngularScope.apply($scope, function () {
                    $location.path('/two/' + $scope.site.name);
                });
            });
        };
        $scope.cancel = function () {
            if (!$scope.site) {
                alert("$scope.site is required!");
                return;
            }
            $location.path('/two/' + $scope.site.name);
        };
    })
})();
'use strict';
require('angular');
var _ = require('lodash');
var Site = require('../../../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('StepEditController', function ($scope, $routeParams, $location, RunInBackgroundScript, AngularScope) {
        console.log('Loading Step Edit Controller...');

        if (!$routeParams.name || !$routeParams.type) {
            return $location.path('/');
        }
        $scope.creationMode = !$routeParams.stepName;
        $scope.editionMode = $routeParams.stepName;

        $scope.currentStep = Site.getDefaults($routeParams.type);

        $scope.breadcrumbReplacements = {
            'Project Name': $routeParams.name,
            'Step Type or Name': $scope.editionMode ? $routeParams.stepName : "New " + $routeParams.type + " step"
        };

        RunInBackgroundScript.getFromLocalStorage($routeParams.name).done(function (siteAsJson) {
            AngularScope.apply($scope, function () {
                $scope.site = siteAsJson;

                if ($scope.editionMode) {
                    var existingStep = _.find($scope.site.steps, function(s){ return s.name === $routeParams.stepName; });
                    if (!existingStep) return $location.path('/projects/' + $scope.site.name);

                    $scope.currentStep = existingStep;
                }
            });
        });
        $scope.isForm = $routeParams.type === Site.TYPES.FORM;
        $scope.isClick = $routeParams.type === Site.TYPES.CLICK;
        $scope.isScrape = $routeParams.type === Site.TYPES.SCRAPE;

        $scope.submit = function () {
            try {
                Site.validateStep($scope.currentStep, $scope.site, $scope.creationMode);
            } catch (exception) {
                return alert(exception.toString());
            }
            if (!$scope.site) {
                alert("$scope.site is required!");
                return;
            }

            if ($scope.creationMode) {
                $scope.site.steps.push($scope.currentStep);
                saveSiteInLocalStorage();
            } else {
                RunInBackgroundScript.getFromLocalStorage($routeParams.name).done(function (site) {
                    var step2EditIdx = _.findIndex(site.steps, function(s){ return s.name === $routeParams.stepName; });
                    if (step2EditIdx === -1) {
                        alert("There was an error when attempting to update the step " + $routeParams.stepName);
                        return;
                    }
                    $scope.site.steps.splice(step2EditIdx, 1, $scope.currentStep);

                    saveSiteInLocalStorage();
                });
            }
        };
        $scope.cancel = function () {
            if (!$scope.site) {
                alert("$scope.site is required!");
                return;
            }
            $location.path('/projects/' + $scope.site.name);
        };

        function saveSiteInLocalStorage() {
            RunInBackgroundScript.setInLocalStorage({key: $routeParams.name, value: new Site($scope.site).toJson()})
                .done(function () {
                    AngularScope.apply($scope, function () {
                        $location.path('/projects/' + $scope.site.name);
                    });
                });
        }
    });
})();
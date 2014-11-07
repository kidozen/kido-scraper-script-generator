/* global window, console, angular */
'use strict';
require('angular');
require('angular-route');
var Site = require('./model/Site');

angular.module('KidoScrapper', ['ngRoute'])
    .factory('KidoStorage', function() {
        var collection = {};
        var factory = {};

        factory.store = function(key, value) {
            collection[key] = new Site(value);
        };

        factory.get = function(key) {
            if (key) {
                return collection[key] ? collection[key].toJson() : undefined;
            }
            return Object
                .keys(collection)
                .map(function(item) {
                    return collection[item].toJson();
                });
        };

        return factory;
    })
    .controller('ZeroController', function($scope, $location, KidoStorage) {
        $scope.sites = KidoStorage.get() || [];
        $scope.addNewSite = function() {
            $location.path('/one');
        };
        $scope.open = function(site) {
            $location.path('/two/' + site.name);
        };
        $scope.export = function(site) {
            console.log(site);
            console.log(new Site(site).toCasper());
        };
    })
    .controller('OneController', function($scope, $location, KidoStorage) {
        $scope.create = function() {
            $scope.name = $scope.name ? $scope.name.toLowerCase() : '';
            if (!$scope.name || !$scope.url) {
                return window.alert('name and url are required');
            }
            if (KidoStorage.get($scope.name)) {
                return window.alert('name already in use');
            }
            var site = Site.getDefaults();
            site.name = $scope.name;
            site.url = $scope.url;
            KidoStorage.store($scope.name, site);
            $location.path('/two/' + $scope.name);
        };
    })
    .controller('TwoController', function($scope, $routeParams, $location, KidoStorage) {
        if (!$routeParams.name) {
            return $location.path('/');
        }
        $scope.types = [{
            id: 'form',
            name: 'Form'
        }, {
            id: 'click',
            name: 'Click'
        }, {
            id: 'scrap',
            name: 'Scrap'
        }];
        $scope.site = KidoStorage.get($routeParams.name);
        $scope.site.steps = $scope.site.steps || [];
        $scope.addStep = function() {
            $location.path('/three/' + $routeParams.name + '/' + $scope.stepType);
        };
    })
    .controller('ThreeController', function($scope, $routeParams, $location, KidoStorage) {
        if (!$routeParams.name) {
            return $location.path('/');
        }
        var stepFormController = function() {
            return {
                addSelector: function() {
                    $scope.currentStep.selectors.push(Site.getDefaults(Site.TYPES.FORM_SELECTOR));
                },
                removeSelector: function(index) {
                    $scope.currentStep.selectors.splice(index, 1);
                },
                validate: function() {
                    return true;
                }
            };
        };
        var stepClickController = function() {
            return {
                validate: function() {
                    return true;
                }
            };
        };
        var stepScrapController = function() {
            return {
                validate: function() {
                    return true;
                }
            };
        };
        $scope.site = KidoStorage.get($routeParams.name);
        $scope.currentStep = Site.getDefaults($routeParams.type);
        console.log($scope.currentStep);
        $scope.submit = function() {
            if ($scope.validate()) {
                $scope.site.steps.push($scope.currentStep);
                KidoStorage.store($routeParams.name, $scope.site);
                $location.path('/zero');
            }
        };
        switch ($routeParams.type) {
            case Site.TYPES.CLICK:
                $scope.template = 'partial/step_click.html';
                angular.extend($scope, stepClickController());
                break;
            case Site.TYPES.FORM:
                $scope.template = 'partial/step_form.html';
                angular.extend($scope, stepFormController());
                break;
            case Site.TYPES.SCRAP:
                $scope.template = 'partial/step_scrap.html';
                angular.extend($scope, stepScrapController());
                break;
            default:
                window.alert('Invalid step type');
        }
    })
    .config(function($routeProvider) {
        $routeProvider
            .when('/zero', {
                templateUrl: 'partial/zero.html',
                controller: 'ZeroController'
            })
            .when('/one', {
                templateUrl: 'partial/one.html',
                controller: 'OneController'
            })
            .when('/two/:name', {
                templateUrl: 'partial/two.html',
                controller: 'TwoController'
            })
            .when('/three/:name/:type', {
                templateUrl: 'partial/three.html',
                controller: 'ThreeController'
            })
            .otherwise({
                redirectTo: '/zero'
            });
    })
    .run();

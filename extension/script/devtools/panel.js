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
            id: Site.TYPES.FORM,
            name: 'Form'
        }, {
            id: Site.TYPES.CLICK,
            name: 'Click'
        }, {
            id: Site.TYPES.SCRAP,
            name: 'Scrap'
        }];
        $scope.stepType = $scope.types[0].id;
        $scope.site = KidoStorage.get($routeParams.name);
        $scope.site.steps = $scope.site.steps || [];
        $scope.addStep = function() {
            $location.path('/three/' + $routeParams.name + '/' + $scope.stepType);
        };
    })
    .controller('ThreeController', function($scope, $routeParams, $location, KidoStorage) {
        if (!$routeParams.name || !$routeParams.type) {
            return $location.path('/');
        }
        $scope.site = KidoStorage.get($routeParams.name);
        $scope.currentStep = Site.getDefaults($routeParams.type);
        $scope.isForm = $scope.currentStep.type === Site.TYPES.FORM;
        $scope.isClick = $scope.currentStep.type === Site.TYPES.CLICK;
        $scope.isScrap = $scope.currentStep.type === Site.TYPES.SCRAP;
        $scope.submit = function() {
            try {
                Site.validateStep($scope.currentStep);
            } catch (exception) {
                return window.alert(exception.toString());
            }
            $scope.site.steps.push($scope.currentStep);
            KidoStorage.store($routeParams.name, $scope.site);
            $location.path('/zero');
        };
    })
    .directive('stepClick', function() {
        return {
            restrict: 'E',
            scope: {
                currentStep: '='
            },
            templateUrl: 'partial/step_click.html',
            link: function(scope) {
                if (!scope.currentStep) throw 'stepClick directive needs a currentStep to work with';
            }
        };
    })
    .directive('stepForm', function() {
        return {
            restrict: 'E',
            scope: {
                currentStep: '='
            },
            templateUrl: 'partial/step_form.html',
            link: function(scope) {
                if (!scope.currentStep) throw 'stepForm directive needs a currentStep to work with';
                scope.addSelector = function() {
                    scope.currentStep.selectors.push(Site.getDefaults(Site.TYPES.FORM_SELECTOR));
                };
                scope.removeSelector = function(index) {
                    scope.currentStep.selectors.splice(index, 1);
                };
            }
        };
    })
    .directive('stepScrap', function() {
        return {
            restrict: 'E',
            scope: {
                currentStep: '='
            },
            templateUrl: 'partial/step_scrap.html',
            link: function(scope) {
                if (!scope.currentStep) throw 'stepScrap directive needs a currentStep to work with';
                var ATTRS = Site.getConstructor(Site.TYPES.SELECTOR).ATTRS;
                scope.attrs = [{
                    id: ATTRS.TEXT,
                    name: 'Text'
                }];
                scope.addField = function() {
                    scope.currentStep.fields.push(Site.getDefaults(Site.TYPES.SELECTOR));
                };
                scope.removeField = function(index) {
                    scope.currentStep.fields.splice(index, 1);
                };
            }
        };
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

/* global window, angular, StepForm */
(function(angular) {
    'use strict';

    angular.module('KidoScrape', ['ngRoute'])

    .factory('KidoStorage', function() {
        var collection = {};
        var factory = {};

        factory.store = function(key, value) {
            collection[key] = value;
        };

        factory.get = function(key) {
            if (key) {
                return collection[key];
            }
            return collection;
        };

        return factory;
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
            KidoStorage.store($scope.name, {
                name: $scope.name,
                url: $scope.url
            });
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
        $scope.site = KidoStorage.get($routeParams.name);
        $scope.currentStep = {
            type: $routeParams.type || 'form',
            selectors: [{
                key: '',
                value: ''
            }]
        };
        $scope.addSelector = function() {
            $scope.currentStep.selectors.push({
                key: '',
                value: ''
            });
        };
        $scope.removeSelector = function(index) {
            $scope.currentStep.selectors.splice(index, 1);
        };
        $scope.submit = function() {
            $scope.site.steps.push($scope.currentStep);
            KidoStorage.store($routeParams.name, $scope.site);
            var stepForm = new StepForm($scope.site.steps[0]);
            console.log(stepForm);
            $location.path('/two/' + $routeParams.name);
        };
    })

    .config(function($routeProvider) {
        $routeProvider
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
                redirectTo: '/one'
            });
    })

    .run();

})(angular);

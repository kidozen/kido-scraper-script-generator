/* global window, angular, Site */
(function(angular) {
    'use strict';

    angular.module('KidoScrape', ['ngRoute'])

    .factory('KidoStorage', function() {
        var collection = {};
        var factory = {};

        factory.store = function(key, value) {
            collection[key] = new Site(value);
        };

        factory.get = function(key) {
            console.log('KidoStorage.get', key);
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
        $scope.export = function(site) {
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
            KidoStorage.store($scope.name, {
                name: $scope.name,
                url: $scope.url,
                steps: []
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
            name: '',
            selectors: [{
                key: '',
                value: ''
            }],
            submit: ''
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
            $location.path('/zero');
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

})(angular);

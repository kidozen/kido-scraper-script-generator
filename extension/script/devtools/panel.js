/* global $, chrome, window, console, angular */
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
        $scope.appcenter = '';
        $scope.chrome = {foo:'adsfa'};
        console.log('loading zero controller');
        $scope.addNewSite = function() {
            $location.path('/one');
        };
        $scope.open = function(site) {
            $location.path('/two/' + site.name);
        };
        $scope.configure = function () {
            alert('alert');
            var tab,
                count   = 0,
                timeout = 60,
                prefix  = 'Success payload=';

            chrome.tabs.create({url: "https://auth-qa.kidozen.com/v1/armonia/sign-in?wtrealm=_marketplace&wreply=urn-ietf-wg-oauth-2.0-oob&wa=wsignin1.0"}, function (t) {
                tab = t;
            });
            function poll() {
                if ((tab && tab.title || '').indexOf(prefix) === 0) {
                    var token = tab.title.substr(prefix.length);
                    saveToken(token);
                    return;
                }
                if (count > timeout) {
                    alert('fail!');
                    return;
                }
                count++;
                setInterval(poll, 1000);
            }
            poll();
            function saveToken(token) {
                console.log(token);
            }
        };
    })
    .controller('OneController', function ($scope, $location, KidoStorage) {
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
        $scope.cancel = function() {
            $scope.name = '';
            $scope.url = '';
            return $location.path('/');
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
        function _addStep(type) {
            $location.path('/three/' + $routeParams.name + '/' + type);
        }
        $scope.addStep = function() {
            _addStep($scope.stepType);
        };
        $scope.addCompleteForm = function () {
            _addStep(Site.TYPES.FORM);
        };
        $scope.addClickEvent = function () {
            _addStep(Site.TYPES.CLICK);
        };
        $scope.addScrap = function () {
            _addStep(Site.TYPES.SCRAP);
        };
        $scope.export = function (site) {
            $location.path('/export/' + site.name);
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
            $location.path('/two/' + $scope.site.name);
        };
        $scope.cancel = function () {
            $location.path('/two/' + $scope.site.name);
        };
    })
    .controller('ExportController', function ($scope, $routeParams, $location, KidoStorage) {
        if (!$routeParams.name) {
            return $location.path('/');
        }
        $scope.site = KidoStorage.get($routeParams.name);
        $scope.json = JSON.stringify($scope.site, 0, 4);
        $scope.script = new Site($scope.site).toCasper();
        $scope.scriptVisible = true;
        $scope.showJson = function () {
            $scope.jsonVisible = true;
            $scope.scriptVisible = false;
        };
        $scope.showScript = function () {
            $scope.jsonVisible = false;
            $scope.scriptVisible = true;
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
    .directive('select2', function () {
        return {
            restrict: 'A',
            link: function (scope, el) {
                $(el).select2();
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
            .when('/export/:name', {
                templateUrl: 'partial/export.html',
                controller: 'ExportController'
            })
            .otherwise({
                redirectTo: '/zero'
            });
    })
    .run();

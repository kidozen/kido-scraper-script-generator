/* global $, chrome, window, console, angular */
'use strict';
require('angular');
require('angular-route');
var Site = require('./model/Site');

angular.module('KidoScraper', ['ngRoute'])
    .factory('KidoStorage', function() {
        console.log("Creating KidoStorage...");
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
    .service('RunInCurrentTabContext', function() {
        // This enables the Chrome extension to work also as a simple web app (for testing)
        var haveToProxyCallsToInspectedPage = chrome && chrome.devtools;

        return getContentScript(haveToProxyCallsToInspectedPage ? "DevTools" : "ContentScript");
    })
    .controller('ZeroController', function($scope, $location, KidoStorage) {
        $scope.sites = KidoStorage.get() || [];
        $scope.appcenter = '';
        console.log('Loading Zero Controller...');
        $scope.addNewSite = function() {
            $location.path('/one');
        };
        $scope.open = function(site) {
            $location.path('/two/' + site.name);
        };
        $scope.configure = function () {
            var tab,
                count   = 0,
                timeout = 60,
                prefix  = 'Success payload=';

            if (chrome && chrome.tabs) {
                console.log("Chrome tabs are present!");
                chrome.tabs.create({url: "https://auth-qa.kidozen.com/v1/armonia/sign-in?wtrealm=_marketplace&wreply=urn-ietf-wg-oauth-2.0-oob&wa=wsignin1.0"}, function (t) {
                    tab = t;
                });
            }
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

            function saveToken(token) {
                console.log(token);
            }

            if (chrome && chrome.tabs) { poll() };
        };
    })
    .controller('OneController', function ($scope, $location, KidoStorage, RunInCurrentTabContext) {
        RunInCurrentTabContext
            .getCurrentPageDetails()
            .done(function (currentPageDetails) {
                if (currentPageDetails) {
                    var updateNameAndUrlWithCurrentPageData = function () {
                        $scope.name = currentPageDetails.title;
                        $scope.url = currentPageDetails.url;
                    };
                    var runningAsAnExtension = chrome && chrome.devtools;

                    if (runningAsAnExtension) {
                        $scope.$apply(updateNameAndUrlWithCurrentPageData);
                    } else {
                        updateNameAndUrlWithCurrentPageData();
                    }
                }
            });

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
            id: Site.TYPES.SCRAPE,
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
        $scope.addScrape = function () {
            _addStep(Site.TYPES.SCRAPE);
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
        $scope.isScrape = $scope.currentStep.type === Site.TYPES.SCRAPE;
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
    .directive('stepClick', function(RunInCurrentTabContext) {
        return {
            restrict: 'E',
            scope: {
                currentStep: '='
            },
            templateUrl: 'partial/step_click.html',
            link: function(scope) {
                if (!scope.currentStep) throw 'stepClick directive needs a currentStep to work with';

                scope.selectSelector = function() {
                    RunInCurrentTabContext
                        .selectSelector({parentCSSSelector: "", allowedElements: "*"})
                        .done(function (retrievedCssSelector) {
                            scope.$apply(function () {
                                scope.currentStep.key = retrievedCssSelector.CSSSelector;
                            });
                        });
                };
            }
        };
    })
    .directive('stepForm', function(RunInCurrentTabContext) {
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
                scope.selectSelector = function(index) {
                    RunInCurrentTabContext
                        .selectSelector({parentCSSSelector: "", allowedElements: "*"})
                        .done(function (retrievedCssSelector) {
                            scope.$apply(function () {
                                if (index === -1) {
                                    scope.currentStep.submit.key = retrievedCssSelector.CSSSelector;
                                } else {
                                    scope.currentStep.selectors[index].key = retrievedCssSelector.CSSSelector;
                                }
                            });
                        });
                };
                scope.removeSelector = function(index) {
                    scope.currentStep.selectors.splice(index, 1);
                };
            }
        };
    })
    .directive('stepScrape', function(RunInCurrentTabContext) {
        return {
            restrict: 'E',
            scope: {
                currentStep: '='
            },
            templateUrl: 'partial/step_scrape.html',
            link: function(scope) {
                if (!scope.currentStep) throw 'stepScrape directive needs a currentStep to work with';
                var ATTRS = Site.getConstructor(Site.TYPES.SELECTOR).ATTRS;
                scope.attrs = [{
                    id: ATTRS.TEXT,
                    name: 'Text'
                }];
                scope.addField = function() {
                    scope.currentStep.fields.push(Site.getDefaults(Site.TYPES.SELECTOR));
                };
                scope.selectSelector = function(index) {
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
    .config(function($routeProvider, $compileProvider) {
        $compileProvider
            .aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|filesystem:chrome-extension|blob:chrome-extension):/);

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
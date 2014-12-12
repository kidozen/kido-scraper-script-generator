/* global $, chrome, window, console, angular */
'use strict';
require('angular');
require('angular-route');
require('./modules/kidoStorage');
require('./modules/auth');

// TODO Get rid of this
Function.prototype.toJSON = function() { return "<function>" };

//TODO Could we require modules only on the places where we actually use them?
angular.module('KidoScraper', ['ngRoute', 'kidoStorage', 'auth'])
    .config(function ($routeProvider, $compileProvider) {
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
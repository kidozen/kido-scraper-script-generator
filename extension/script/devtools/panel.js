/* global $, chrome, window, console, angular */
'use strict';
require('angular');
require('angular-route');
require('angular-loading-bar');
require("simple-errors");
var Site = require('./model/Site');

angular.module('KidoScraper', ['ngRoute', 'angular-loading-bar', 'ui.bootstrap'])
    .config(function ($routeProvider, $compileProvider, $tooltipProvider) {
        $compileProvider
            .aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|filesystem:chrome-extension|blob:chrome-extension):/);

        // when the user either leaves the element or clicks on it, the tooltip/popover will go off.
        $tooltipProvider.setTriggers({
            'mouseenter': 'mouseleave click',
            'click': 'click',
            'focus': 'blur'
        });

        $routeProvider
            .when('/projects', {
                templateUrl: 'partial/project/project_list.html',
                controller: 'ListProjectsController'
            })
            .when('/projects/create', {
                templateUrl: 'partial/project/project_create.html',
                controller: 'CreateProjectController'
            })
            .when('/projects/:name', {
                templateUrl: 'partial/project/project_detail.html',
                controller: 'ProjectDetailsController'
            })
            .when('/projects/step/edit/:siteName/:type/:stepName?', {
                templateUrl: 'partial/project/step/step_edit.html',
                controller: 'StepEditController'
            })
            .when('/projects/export/:name', {
                templateUrl: 'partial/project/project_export.html',
                controller: 'ProjectExportController'
            })
            .when('/projects/run/:name', {
                templateUrl: 'partial/project/project_run.html',
                controller: 'ProjectRunController'
            })
            .when('/services', {
                templateUrl: 'partial/service/service_list.html',
                controller: 'ListServicesController'
            })
            .when('/datasources', {
                templateUrl: 'partial/datasource/ds_list.html',
                controller: 'ListDatasourcesController'
            })
            .when('/datasources/create', {
                templateUrl: 'partial/datasource/ds_create.html',
                controller: 'CreateDatasourceController'
            })
            .when('/datasources/create/:siteName/:serviceName?', {
                templateUrl: 'partial/datasource/ds_create.html',
                controller: 'CreateDatasourceController'
            })
            .when('/datasources/run/:dsName', {
                templateUrl: 'partial/datasource/ds_run.html',
                controller: 'RunDatasourceController'
            })
            .otherwise({
                redirectTo: '/projects'
            });
    })
    .run(function ($window, $rootScope) {
        $rootScope.goBack = function () {
            $window.history.back();
        }
    });
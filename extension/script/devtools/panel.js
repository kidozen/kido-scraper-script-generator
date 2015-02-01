/* global $, chrome, window, console, angular */
'use strict';
require('angular');
require('angular-route');
require('angular-loading-bar');
require("simple-errors");
var Site = require('./model/Site');

angular.module('KidoScraper', ['ngRoute', 'angular-loading-bar', 'ui.bootstrap', 'ng-breadcrumbs'])
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
                controller: 'ListProjectsController',
                label: 'Projects'
            })
            .when('/projects/create', {
                templateUrl: 'partial/project/project_create.html',
                controller: 'CreateProjectController',
                label: 'New'
            })
            .when('/projects/:name', {
                templateUrl: 'partial/project/project_detail.html',
                controller: 'ProjectDetailsController',
                label: 'Project Name'
            })
            .when('/projects/:name/step/edit/:type/:stepName?', {
                templateUrl: 'partial/project/step/step_edit.html',
                controller: 'StepEditController',
                label: 'Step Type or Name'
            })
            .when('/projects/:name/export', {
                templateUrl: 'partial/project/project_export.html',
                controller: 'ProjectExportController',
                label: 'Export'
            })
            .when('/projects/:name/run', {
                templateUrl: 'partial/project/project_run.html',
                controller: 'ProjectRunController',
                label: 'Run'
            })
            .when('/datasources', {
                templateUrl: 'partial/datasource/ds_list.html',
                controller: 'ListDatasourcesController',
                label: 'Datasources'
            })
            .when('/datasources/create', {
                templateUrl: 'partial/datasource/ds_create.html',
                controller: 'CreateDatasourceController',
                label: 'New'
            })
            .when('/datasources/create/:siteName/:serviceName?', {
                templateUrl: 'partial/datasource/ds_create.html',
                controller: 'CreateDatasourceController',
                label: 'New'
            })
            .when('/datasources/:dsName/run', {
                templateUrl: 'partial/datasource/ds_run.html',
                controller: 'RunDatasourceController',
                label: 'Run'
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
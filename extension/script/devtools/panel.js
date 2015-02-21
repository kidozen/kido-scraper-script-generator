/* global $, chrome, window, console, angular */
'use strict';

var kidoScraper = require('./KidoScraper');

require('./controllers/project/ProjectCreateOrEditController');
require('./controllers/project/ProjectListController');
require('./controllers/project/ProjectDetailsController');
require('./controllers/project/ProjectExportController');
require('./controllers/project/ProjectRunController');
require('./controllers/project/step/StepEditController');
require('./controllers/datasource/CreateDatasourceController');
require('./directives/BreadcrumbDirective');
require('./directives/StepClickDirective');
require('./directives/StepSelectDirective');
require('./directives/StepFormDirective');
require('./directives/StepScrapeDirective');
require('./directives/Select2Directive');
require('./directives/RegexpMatchingDirective');

kidoScraper
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
                controller: 'ProjectListController',
                label: 'Projects'
            })
            .when('/projects/create', {
                templateUrl: 'partial/project/project_edit.html',
                controller: 'ProjectCreateOrEditController',
                label: 'New'
            })
            .when('/projects/:name/edit_basic_details', {
                templateUrl: 'partial/project/project_edit.html',
                controller: 'ProjectCreateOrEditController',
                label: 'Edit Basic Details'
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
            .when('/datasources/create/:siteName/:serviceName?/:method?', {
                templateUrl: 'partial/datasource/ds_create.html',
                controller: 'CreateDatasourceController',
                label: 'New Datasource'
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
/* jshint node: true, browser: false */
'use strict';
var glob = require('glob');
var gulp = require('gulp');
var connect = require('gulp-connect');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var basePath = './extension/script/devtools';

gulp.task('browserify', function () {
    // The order here is important!
    return browserify([
        basePath + '/panel.js',
        basePath + '/services/AngularScope.js',
        basePath + '/services/BaseErrorHandler.js',
        basePath + '/services/RunInCurrentTabContext.js',
        basePath + '/services/RunInBackgroundScript.js',
        basePath + '/services/DatasourceService.js',
        basePath + '/services/ServiceService.js',
        basePath + '/controllers/project/CreateProjectController.js',
        basePath + '/controllers/project/ListProjectsController.js',
        basePath + '/controllers/project/ProjectDetailsController.js',
        basePath + '/controllers/project/ProjectExportController.js',
        basePath + '/controllers/project/ProjectRunController.js',
        basePath + '/controllers/project/step/StepEditController.js',
        basePath + '/controllers/datasource/CreateDatasourceController.js',
        basePath + '/controllers/datasource/ListDatasourcesController.js',
        basePath + '/controllers/datasource/RunDatasourceController.js',
        basePath + '/directives/StepClickDirective.js',
        basePath + '/directives/StepFormDirective.js',
        basePath + '/directives/StepScrapeDirective.js',
        basePath + '/directives/Select2Directive.js',
        basePath + '/directives/RegexpMatchingDirective.js'])
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./extension/'));
});

gulp.task('browserify-watch', ['browserify'], function () {
    var srcFiles = glob.sync('./extension/script/devtools/**/*.js');
    gulp.watch(srcFiles, ['browserify']);
});

gulp.task('server', function () {
    connect.server({
        root: './extension',
        port: 9090
    });
});

gulp.task('dev', ['browserify-watch', 'server']);

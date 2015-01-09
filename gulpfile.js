/* jshint node: true, browser: false */
'use strict';
var glob = require('glob');
var gulp = require('gulp');
var connect = require('gulp-connect');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var basePath = './extension/script/devtools';

gulp.task('browserify', function() {
    // The order here is important!
    return browserify([basePath + '/panel.js',
                       basePath + '/services/AngularScope.js',
                       basePath + '/services/BaseErrorHandler.js',
                       basePath + '/services/RunInCurrentTabContext.js',
                       basePath + '/services/RunInBackgroundScript.js',
                       basePath + '/services/DatasourceService.js',
                       basePath + '/controllers/ZeroController.js',
                       basePath + '/controllers/OneController.js',
                       basePath + '/controllers/TwoController.js',
                       basePath + '/controllers/ThreeController.js',
                       basePath + '/controllers/ExportController.js',
                       basePath + '/controllers/RunController.js',
                       basePath + '/controllers/datasource/CreateDSController.js',
                       basePath + '/directives/StepClickDirective.js',
                       basePath + '/directives/StepFormDirective.js',
                       basePath + '/directives/StepScrapeDirective.js',
                       basePath + '/directives/Select2Directive.js'])
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./extension/'));
});

gulp.task('browserify-watch', ['browserify'], function() {
	var srcFiles = glob.sync('./extension/script/devtools/**/*.js');
    gulp.watch(srcFiles, ['browserify']);
});

gulp.task('server', function() {
    connect.server({
        root: './extension',
        port: 9090
    });
});

gulp.task('dev', ['browserify-watch', 'server']);

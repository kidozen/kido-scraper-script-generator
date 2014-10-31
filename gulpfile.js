/* jshint node: true, browser: false */
'use strict';
var gulp = require('gulp');
var connect = require('gulp-connect');
var plumber = require('gulp-plumber');
var shell = require('gulp-shell');

gulp.task('server', function() {
    connect.server({
        root: './extension',
        port: 9090
    });
});

gulp.task('integration-tests', function() {
    gulp.src('')
        .pipe(plumber())
        .pipe(shell(['casperjs test ./test/index.js']));
});

gulp.task('test', ['server', 'integration-tests']);

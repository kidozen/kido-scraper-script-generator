/* jshint node: true, browser: false */
'use strict';
var gulp = require('gulp');
var connect = require('gulp-connect');

gulp.task('server', function() {
    connect.server({
        root: './extension',
        port: 9090
    });
});

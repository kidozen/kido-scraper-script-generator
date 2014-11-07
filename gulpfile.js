/* jshint node: true, browser: false */
'use strict';
var glob = require('glob');
var gulp = require('gulp');
var connect = require('gulp-connect');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var srcFiles = glob.sync('./extension/script/devtools/**/*.js');

gulp.task('browserify', function() {
    return browserify('./extension/script/devtools/panel.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./extension/'));
});

gulp.task('browserify-watch', function() {
    gulp.watch(srcFiles, ['browserify']);
});

gulp.task('server', function() {
    connect.server({
        root: './extension',
        port: 9090
    });
});

gulp.task('dev', ['browserify-watch', 'server']);

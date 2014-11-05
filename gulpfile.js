/* jshint node: true, browser: false */
'use strict';
var spawn = require('child_process').spawn;
var gulp = require('gulp');
var gutil = require('gulp-util');
var connect = require('gulp-connect');

gulp.task('server', function() {
    connect.server({
        root: './extension',
        port: 9090
    });
});

gulp.task('integration-tests', ['server'], function() {
    var tests = ['test/index.js'];
    var casperChild = spawn('casperjs', ['test'].concat(tests));
    casperChild.stdout.on('data', function(data) {
        gutil.log(data.toString().slice(0, -1));
    });
    casperChild.on('close', function(code) {
        if (code === 0) {
            console.log('Done with success');
        } else {
            console.error('Done with errors');
        }
        process.exit(code);
    });
});

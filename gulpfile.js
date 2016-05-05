var gulp = require('gulp');
var path = require('path');

gulp.task('clean', function (done) {
    var fs = require('fs-extra');
    fs.remove(path.join(__dirname, 'build'), done);
});

gulp.task('build', ['clean'], function () {
    var webpack = require('webpack-stream');
    return gulp.src('test/**/*.test.js')
        .pipe(webpack(require('./test/webpack.config')))
        .pipe(gulp.dest('build/'));
});

gulp.task('pre-test', function() {
    var istanbul = require('gulp-istanbul');
    return gulp.src(['index.js', 'lib/**/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test', 'build'], function () {
    var mocha = require('gulp-mocha');
    var istanbul = require('gulp-istanbul');
    return gulp.src('build/**/*.js', {read: false})
        .pipe(mocha())
        .pipe(istanbul.writeReports());
});

gulp.task('default', ['test']);

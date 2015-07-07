'use strict';

var gulp = require('gulp'),
  lazypipe = require('lazypipe'),
  runSequence = require('run-sequence'),
  gif = require('gulp-if'),
  bump = require('gulp-bump'),
  tap = require('gulp-tap'),
  git = require('gulp-git'),
  tagVersion = require('gulp-tag-version'),
  concat = require('gulp-concat'),
  header = require('gulp-header'),
  ngAnnotate = require('gulp-ng-annotate'),
  gwebpack = require('gulp-webpack'),
  webpack = require('webpack'),
  babel = require('gulp-babel'),
  jshint = require('gulp-jshint'),
  karma = require('gulp-karma'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  util = require('gulp-util'),
  del = require('del');

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %> - <%= now %>',
  ' * @link <%= pkg.homepage %>',
  ' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>',
  ' * @license MIT License, http://www.opensource.org/licenses/MIT',
  ' */',
  ''].join('\n');

function jsSourcePipe() {
  return gulp.src(['*.js', '!gulpfile.js', '!karma.conf.js'])
    /* jshint camelcase: false */
    .pipe(ngAnnotate({ add: true, single_quotes: true }));
}

function getOutputPipe(pkg) {
  return lazypipe()
    .pipe(babel, { compact: false, comments: false })
    .pipe(header, banner, { pkg: pkg, now: (util.date(new Date(), 'yyyy-mm-dd')) })
    .pipe(gulp.dest, 'dist')
    .pipe(rename, { suffix: '.min' })
    .pipe(uglify, { preserveComments: 'some' })
    .pipe(gulp.dest, 'dist');
}


function getJSHintPipe(rc) {
  return lazypipe()
    .pipe(jshint, rc || '.jshintrc')
    .pipe(jshint.reporter, 'jshint-stylish')
    .pipe(jshint.reporter, 'fail');
}

gulp.task('js-single', ['jshint'], function () {
  return jsSourcePipe()
    .pipe(getOutputPipe(require('./package.json'))());
});

gulp.task('js-full', ['jshint'], function () {
  return jsSourcePipe()
    .pipe(gwebpack({
      output: {
        library: 'hrRoot',
        filename: 'angular-hy-res-full.js',
        libraryTarget: 'var'
      },
      externals: {
        'angular': 'angular'
      }
    }))
    .pipe(getOutputPipe(require('./package.json'))());
});

gulp.task('clean', function(cb) {
  del('dist/**', cb);
});

gulp.task('build', ['clean'], function(cb) {
  return runSequence(['js-single', 'js-full'], cb);
});

gulp.task('jshint', ['jshint:src', 'jshint:test', 'jshint:gulpfile']);

gulp.task('jshint:src', function() {
  return jsSourcePipe()
    .pipe(getJSHintPipe()());
});

gulp.task('jshint:test', function() {
  return gulp.src('test/**/*.js')
    .pipe(getJSHintPipe('test/.jshintrc')());
});

gulp.task('jshint:gulpfile', function() {
  return gulp.src('gulpfile.js')
    .pipe(getJSHintPipe()());
});

function runKarma(action) {
  return gulp.src('/test/spec/**/*.js')
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: action || 'run'
    })).on('error', function(err) {
      throw err;
    });
}

gulp.task('karma', function() {
  return runKarma();
});

gulp.task('karma:watch', function() {
  return runKarma('watch');
});

gulp.task('test', ['jshint', 'karma'], function() {
});

gulp.task('bump', ['test'], function() {
  return gulp.src('./*.json')
    .pipe(bump({ type: gulp.env.type || 'patch' }))
    .pipe(gulp.dest('./'));
});

gulp.task('bump-commit', ['build'], function() {
  var version = require('./package.json').version;
  return gulp.src(['dist/*.js','./*.json'])
    .pipe(git.commit('Release v' + version));
});

gulp.task('tag', function() {
  return gulp.src('package.json')
    .pipe(tagVersion());
});

gulp.task('release', function(cb) {
  runSequence(
    'bump',
    'bump-commit',
    'tag',
    cb
  );
});

gulp.task('default', ['build']);

'use strict';

var _ = require('lodash');
var config = require('../config/env/all.js');
var languages = config.languages;
var languageCode = config.currentLanguage;

var currentLanguage = _(languages).find(function(language) {
  return language.name === languageCode;
});

var gulp = require('gulp'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  through = require('through'),
  gutil = require('gulp-util'),
  plugins = gulpLoadPlugins(),
  paths = {
    js: ['*.js', 'test/**/*.js', '!test/coverage/**', '!bower_components/**', '!packages/**/node_modules/**', '!packages/contrib/**/*.js', '!packages/contrib/**/node_modules/**', '!packages/core/**/*.js', '!packages/core/public/assets/lib/**/*.js'],
    html: ['packages/**/public/**/views/**', 'packages/**/server/views/**'],
    css: ['!bower_components/**', 'packages/**/public/**/css/*.css', '!packages/contrib/**/public/**/css/*.css', '!packages/core/**/public/**/css/*.css'],
    less: ['**/public/**/less/**/*.less'],
    sass: ['**/public/**/css/*.scss']
  };

/*var defaultTasks = ['clean', 'jshint', 'less', 'csslint', 'devServe', 'watch'];*/
var defaultTasks = ['clean',  'less', 'sass', 'devServe', 'watch'];

gulp.task('env:development', function () {
  process.env.NODE_ENV = 'development';
});

gulp.task('jshint', function () {
  return gulp.src(paths.js)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.jshint.reporter('fail'))
    .pipe(count('jshint', 'files lint free'));
});

// gulp.task('csslint', function () {
//   return gulp.src(paths.css)
//     .pipe(plugins.csslint('.csslintrc'))
//     .pipe(plugins.csslint.reporter())
//     .pipe(count('csslint', 'files lint free'));
// });

gulp.task('sass', function() {
  return gulp.src(paths.sass)
    .pipe(plugins.sass())
    .pipe(currentLanguage.direction === 'rtl' ? plugins.rtlcss({
      clean: false
    }) : gutil.noop())
    .pipe(gulp.dest(function (vinylFile) {
      return vinylFile.cwd;
    }));
});

gulp.task('less', function() {
  return gulp.src(paths.less)
    .pipe(plugins.less())
    .pipe(gulp.dest(function (vinylFile) {
      return vinylFile.cwd;
    }));
});

gulp.task('devServe', ['env:development'], function () {
  plugins.nodemon({
    script: 'server.js',
    ext: 'html js',
    env: { 'NODE_ENV': 'development' } ,
    ignore: ['node_modules/', 'packages/custom/**/public/'],
    nodeArgs: ['--debug']
  });
});

gulp.task('watch', function () {
  gulp.watch(paths.js, ['jshint']).on('change', plugins.livereload.changed);
  gulp.watch(paths.html).on('change', plugins.livereload.changed);
  // gulp.watch(paths.css, ['csslint']).on('change', plugins.livereload.changed);
  gulp.watch(paths.less, ['less']).on('change', plugins.livereload.changed);
  gulp.watch(paths.sass, ['sass']).on('change', plugins.livereload.changed);
  plugins.livereload.listen({interval: 500});
});

function count(taskName, message) {
  var fileCount = 0;

  function countFiles(file) {
    fileCount++; // jshint ignore:line
  }

  function endStream() {
    gutil.log(gutil.colors.cyan(taskName + ': ') + fileCount + ' ' + message || 'files processed.');
    this.emit('end'); // jshint ignore:line
  }
  return through(countFiles, endStream);
}

gulp.task('development', defaultTasks);

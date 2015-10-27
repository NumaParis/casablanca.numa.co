// Gulp dependencies
var gulp = require('gulp');
var less = require('gulp-less');
var htmlmin = require('gulp-html-minifier');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jade = require('jade');
var gulpJade = require('gulp-jade');
var dirSync = require('gulp-dir-sync');
// good resource for understanding gulp
// http://travismaynard.com/writing/getting-started-with-gulp

gulp.task('jade', function () {
  return gulp.src('src/views/*.jade')
    .pipe(gulpJade({
      jade: jade,
      pretty: true
    }))
    .pipe(gulp.dest('dist/'))
})

// Lint Task
gulp.task('lint', function() {
    return gulp.src('src/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        // .pipe(concat('all.js'))
        // .pipe(gulp.dest('dist/js'))
        // .pipe(rename('all.min.js'))
        // .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

var EXPRESS_PORT = 4000;
var EXPRESS_ROOT = __dirname + '/dist';
var LIVERELOAD_PORT = 35729;
 
// Let's make things more readable by
// encapsulating each part's setup
// in its own method
function startExpress() {
	var express = require('express');
	var app = express();
	app.use(require('connect-livereload')());
	app.use(express.static(EXPRESS_ROOT));
	app.listen(EXPRESS_PORT);
}
 
// We'll need a reference to the tinylr
// object to send notifications of file changes
// further down
var lr;
function startLivereload() {
 
  lr = require('tiny-lr')();
  lr.listen(LIVERELOAD_PORT);
}
 
// Notifies livereload of changes detected
// by `gulp.watch()` 
function notifyLivereload(event) {
  // `gulp.watch()` events provide an absolute path
  // so we need to make it relative to the server root
  var fileName = require('path').relative(EXPRESS_ROOT, event.path);
 
  lr.changed({
    body: {
      files: [fileName]
    }
  });
}


gulp.task('less', function () {
  gulp.src(['src/less/style.less'])
    .pipe(less({
      paths: ['src/less/']
    }))
    .on('error', function (err) {
      console.log(err);
    })
    .pipe(gulp.dest('dist/css/'));
});


gulp.task('minify', function() {
  gulp.src('src/views/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist/'))
});

gulp.task('sync', function() {
  dirSync('src/assets', 'dist/assets/');
  dirSync('src/images', 'dist/images/');
});

// Default task that will be run
// when no parameter is provided
// to gulp
gulp.task('default', function () {

  startExpress();
  startLivereload();
  
  gulp.watch('dist/*.html', notifyLivereload);
  gulp.watch('dist/css/style.css', notifyLivereload);
  gulp.watch('dist/js/*.js', notifyLivereload);
  gulp.watch('src/less/*.less', ['less']);
  gulp.watch('src/views/*.html', ['minify']);
  gulp.watch('src/views/*.jade', ['jade']);
  gulp.watch('src/js/*.js', ['lint']);
});
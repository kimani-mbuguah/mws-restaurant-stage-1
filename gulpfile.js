const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();

browserSync.init({
  server: "./"
});
browserSync.stream()

gulp.task('default', function() {
  gulp.watch('sass/**/*.scss', ['styles'])
});

gulp.task('styles', function() {
  gulp.src('sass/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({
    browsers: ['last 2 versions']
  }))
  .pipe(gulp.dest('./css'));
})
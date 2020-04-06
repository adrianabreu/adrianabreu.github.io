var gulp = require('gulp');
var sass = require('gulp-sass');
var run = require('gulp-run-command').default;

gulp.task('build', run('hugo serve -s ../../'))

gulp.task('styles', function () {
    gulp.src('./scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./static/css/'))
});

gulp.task('styles:watch', function () {
    gulp.watch('./scss/**/*.scss', ['styles']);
});

//Watch task
gulp.task('default', ['build', 'styles:watch']);

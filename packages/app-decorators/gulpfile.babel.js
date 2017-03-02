import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import changed from 'gulp-changed';

gulp.task('compile:src', () => {
    return gulp.src('src/**/*.js')
        .pipe(changed('./'))
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/lib'));
});

gulp.task('compile:test', () => {
    return gulp.src('test/**/*.js')
        .pipe(changed('./'))
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/test'));
});

gulp.task('watch', function() {
    gulp.watch(
        ['src/**/*.js', 'test/**/*.js'],
        ['compile:src', 'compile:test']
    );
});

gulp.task('compile', ['compile:src', 'compile:test']);
gulp.task('compile-watch', ['compile:src', 'compile:test', 'watch']);

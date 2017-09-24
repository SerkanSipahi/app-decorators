const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const changed = require('gulp-changed');

gulp.task('compile:src', () => {
	return gulp.src('src/**/*.js')
		.pipe(changed('packages/app-decorators/src'))
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('packages/app-decorators/src'))
    	.pipe(gulp.dest('packages/app-decorators/lib'));
});

gulp.task('compile:test', () => {
	return gulp.src('test/**/*.js')
		.pipe(changed('packages/app-decorators/test'))
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('packages/app-decorators/test'));
});

gulp.task('watch', function() {
	gulp.watch(
		['src/**/*.js', 'test/**/*.js'],
		['compile:src', 'compile:test']
	);
});

gulp.task('compile', ['compile:src', 'compile:test']);
gulp.task('compile-watch', ['compile:src', 'compile:test', 'watch']);

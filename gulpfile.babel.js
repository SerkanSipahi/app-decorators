
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import changed from 'gulp-changed';
import replace from 'gulp-replace';

gulp.task('compile:src', () => {
	return gulp.src('src/**/*.js')
		.pipe(changed('dist/src'))
		.pipe(replace(/([^:]\/\/([^#]).*|\/\*[\s\S]*?\*\/)/gm, ''))
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/src'));
});

gulp.task('compile:test', () => {
	return gulp.src('test/**/*.js')
		.pipe(changed('dist/test'))
		.pipe(replace(/([^:]\/\/([^#]).*|\/\*[\s\S]*?\*\/)/gm, ''))
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/test'));
});

gulp.task('watch', function() {
	gulp.watch(
		['src/**/*.js', 'test/**/*.js'],
		['compile:src', 'compile:test']
	);
});

gulp.task('test', ['watch', 'compile:src', 'compile:test']);

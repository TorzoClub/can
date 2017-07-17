const child_process = require('child_process')
const gulp = require("gulp")
const babel = require("gulp-babel")
const sourcemaps = require("gulp-sourcemaps")
const concat = require("gulp-concat")
const less = require('gulp-less')
const path = require('path')
const notify = require('gulp-notify')
const plumber = require('gulp-plumber')
const beep = require('beeper')


gulp.task('front-less', () => {
	return gulp.src('static/less/*.less')
		.pipe(plumber({
			errorHandler: function (err) {
				beep('*-*-')
				notify.onError('Error: <%= error.message %>').apply(this, arguments)
			}
		}))
		.pipe(less({
			paths: [ 'static/less/' ],
		}))
		.pipe(gulp.dest('static/style/'))
})
gulp.task('front-es6toes5', () => {
	return gulp.src("static/src/*.js")
		.pipe(plumber({
			errorHandler: function (err) {
				beep('*-*-')
				notify.onError('Error: <%= error.message %>').apply(this, arguments)
			}
		}))
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("static/script/"))
})

gulp.task('admin-front-less', () => {
	return gulp.src('static/admin/less/*.less')
		.pipe(plumber({
			errorHandler(err) {
				beep('*-*-')
				notify.onError('Error: <%= error.message %>').apply(this, arguments)
			}
		}))
		.pipe(less({
			paths: ['static/admin/less']
		}))
		.pipe(gulp.dest('static/admin/style/'))
})
gulp.task('admin-front-es6toes5', () => {
	return gulp.src('static/admin/src/*.js')
		.pipe(plumber({
			errorHandler: function (err) {
				beep('*-*-')
				notify.onError('Error: <%= error.message %>').apply(this, arguments)
			}
		}))
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('static/admin/script/'))
})


gulp.task('watch', () => {
	gulp.watch('static/src/*.js', ['front-es6toes5'])
	gulp.watch('static/less/*.less', ['front-less'])

	gulp.watch('static/admin/src/*.js', ['admin-front-es6toes5'])
	gulp.watch('static/admin/less/*.less', ['admin-front-less'])
})

gulp.task('default', ['front-less', 'watch'])

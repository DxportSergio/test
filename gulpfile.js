const { src, dest, series, parallel, watch } = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const sourcemaps = require('gulp-sourcemaps')
const cssnano = require('gulp-cssnano')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const kit = require('gulp-kit');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload
const clean = require('gulp-clean');

const punycode = require('punycode/')

const paths = {
	kit: './html/**/*.kit',
	sass: './src/sass/**/*.scss',
	js: './src/js/**/*.js',
	img: './src/img/*',
	dist: './dist',
	sassDest: './dist/css',
	jsDest: './dist/js',
	imgDest: './dist/img',
}

function sassCompiller(done) {
	src(paths.sass)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		// .pipe(dest(paths.sassDest))
		.pipe(postcss([autoprefixer()]))
		.pipe(cssnano())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.sassDest))
	done()
}

function javaScript(done) {
	src(paths.js)
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		// .pipe(dest(paths.jsDest))
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.jsDest))
	done()
}

function handleKits(done) {
	src(paths.kit).pipe(kit()).pipe(dest('./'))
	done()
}

function startBrowserSync(done) {
	browserSync.init({
        server: {
            baseDir: "./"
        }
    });
}

function watchForChanges(done) {
	watch('./*.html').on('change', reload)
	watch([paths.kit, paths.sass, paths.js], parallel(handleKits, sassCompiller, javaScript)).on('change', reload)
	done()
}

function cleanStuff(done) {
	src(paths.dist, { read: false }).pipe(clean())
	done()
}

const mainFunctions = parallel(startBrowserSync, watchForChanges)
exports.default = series(handleKits, sassCompiller, javaScript, mainFunctions)
exports.cleanStuff = cleanStuff
const browserSync = require('browser-sync')
const del = require('del')
const gulp = require('gulp')
const gulpStylelint = require('gulp-stylelint')
const sass = require('gulp-sass')
const util = require('gulp-util')

/*
 * Configuration
 */
let config = {
  dist: !!util.env.dist,
  paths: {
    build: 'build/',
    dist: 'dist/',
    src: 'src/'
  }
}

/*
 * Cleanup build files
 */
function clean () {
  return del([getPath()])
}

/**
 * Get the path of the current environment
 * @returns {string}
 */
function getPath () {
  return config.dist ? config.paths.dist : config.paths.build
}

/*
 * Compile Sass
 */
function compile () {
  let options = {
    outputStyle: 'nested'
  }

  if (config.dist) {
    options['outputStyle'] = 'compressed'
  }

  return gulp.src(config.paths.src + '**/*.scss')
    .pipe(sass(options).on('error', sass.logError))
    .pipe(gulp.dest(getPath() + '/css'))
}

/*
 * Copy HTML files to build directory
 */
function copy () {
  return gulp.src(config.paths.src + '**/*.html', {
    'base': config.paths.src
  })
    .pipe(gulp.dest(getPath()))
}

// Reload the local server
function reload (done) {
  browserSync.reload()
  done()
}

function lint () {
  return gulp.src('**/07-utilities/_utilities.widths.scss')
    .pipe(gulpStylelint({
      reporters: [
        { formatter: 'string', console: true }
      ]
    }))
}

/*
 * Start a development server
 */
function server (done) {
  if (!config.dist) {
    browserSync.init({
      port: 1337,
      reloadDelay: 250,
      server: getPath()
    })
  }
  done()
}

/*
 * Watch HTML and SCSS files for changes
 */
function watch () {
  gulp.watch(config.paths.src + '**/*.html', gulp.series(copy, reload))
  gulp.watch(config.paths.src + '**/*.scss', gulp.series(compile, reload))
}

let buildTask = gulp.series(clean, compile, copy)
let defaultTask = gulp.series(buildTask, server, watch)

exports.clean = clean
exports.compile = compile
exports.copy = copy
exports.lint = lint
exports.reload = reload
exports.server = server
exports.watch = watch

/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.build = buildTask
exports.default = defaultTask

let gulp = require('gulp')
let browserSync = require('browser-sync')
let del = require('del')
let stylelint = require('gulp-stylelint')
let sass = require('gulp-sass')
let util = require('gulp-util')

// Config
let config = {
  dist: !!util.env.dist,
  paths: {
    build: 'build/',
    dist: 'dist/',
    src: 'src/'
  }
}

/**
 * Get the path of the current environment
 * @returns {string}
 */
function getPath () {
  return config.dist ? config.paths.dist : config.paths.build
}

// Cleanup build files
gulp.task('delete', function (done) {
  return del([getPath()], done)
})

// Copy assets to build
gulp.task('html', function () {
  return gulp.src(config.paths.src + '**/*.html', {
    'base': config.paths.src
  })
    .pipe(gulp.dest(getPath()))
})

// Lint CSS
gulp.task('lint-css', function () {

  return gulp
    .src(config.paths.src + '**/*.scss')
    .pipe(stylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }))
})

// Compile Sass to CSS
gulp.task('sass', function () {
  let options = {
    outputStyle: 'nested'
  }

  if (config.dist) {
    options['outputStyle'] = 'compressed'
  }

  return gulp.src(config.paths.src + '**/*.scss')
    .pipe(sass(options).on('error', sass.logError))
    .pipe(gulp.dest(getPath() + '/css'))
})

// Watch HTML and SCSS files for changes
gulp.task('watch', function () {
  gulp.watch(config.paths.src + '**/*.html', gulp.series('html', reload))
  gulp.watch(config.paths.src + '**/*.scss', gulp.series('sass', reload))
})

// Reload the local server
function reload(done) {
  browserSync.reload()
  done()
}

// Start a local server
gulp.task('server', function (done) {
  if (!config.dist) {
    browserSync.init({
      port: 1337,
      reloadDelay: 250,
      server: getPath()
    })
  }
  done()
})

// Build the files
gulp.task('build', function (done) {
  gulp.series('delete', 'sass', 'html')
  done()
})

// Default task
gulp.task('default', gulp.series('build', 'server', 'watch'), function () {})

let browserSync = require('browser-sync');
let del = require('del');
let runSequence = require('run-sequence');
let gulp = require('gulp');
let sass = require('gulp-sass');
let util = require('gulp-util');

// Config
let config = {
    dist: !!util.env.dist,
    paths: {
        build: 'build/',
        dist: 'dist/',
        src: 'src/',
    },
};

/**
 * Get the path of the current environment
 * @returns {string}
 */
function getPath () {
    return config.dist ? config.paths.dist : config.paths.build;
}

// Cleanup
gulp.task('delete', function () {
    return del([getPath()]);
});

// Copy assets to build
gulp.task('html', function () {
    return gulp.src(config.paths.src + '**/*.html', {
        'base': config.paths.src,
    })
        .pipe(gulp.dest(getPath()));
});

// Sass
gulp.task('sass', function () {
    let options = {
        outputStyle: 'nested',
    };

    if (config.dist) {
        options['outputStyle'] = 'compressed';
    }

    return gulp.src(config.paths.src + '**/*.scss')
        .pipe(sass(options).on('error', sass.logError))
        .pipe(gulp.dest(getPath() + '/css'));
});

// Watch
gulp.task('watch', function () {
    gulp.watch(config.paths.src + '**/*.html', ['html']).on('change', browserSync.reload);
    gulp.watch(config.paths.src + '**/*.scss', ['sass']).on('change', browserSync.reload);
});

// Server
gulp.task('server', function () {
    if (!config.dist) {
        browserSync.init({
            port: 1337,
            server: getPath(),
        });
    }
});

// Build
gulp.task('build', function () {
    runSequence('delete', 'sass', 'html');
});

// Default
gulp.task('default', ['build', 'server', 'watch']);

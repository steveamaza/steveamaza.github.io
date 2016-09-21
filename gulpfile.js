// Module Dependencies
var cp          = require('child_process'),
    gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    sass        = require('gulp-sass'),
    autoprefix  = require('gulp-autoprefixer');
    ghPages     = require('gulp-gh-pages');

var paths = {
  siteDir: '_site/',
  sassDir: '_sass/',
  cssDir: 'assets/stylesheets/',
  jsDir: 'assets/javascripts/'
};

var jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

// Wait for jekyll:devbuild, then launch the Server
gulp.task('browser-sync', ['sass', 'jekyll:devbuild'], function () {
  browserSync({
    server: { baseDir: paths.siteDir },
    notify: false
  });
});


// Build the Jekyll Site for development
gulp.task('jekyll:devbuild', function (done) {
  return cp.spawn(jekyll, ['build', '--config', ['_config.yml', '_config.dev.yml']], {
      stdio: 'inherit'
    })
    .on('close', done);
});


// Build the Jekyll Site for production
gulp.task('jekyll:build', function (done) {
  return cp.spawn(jekyll, ['build'], {
      stdio: 'inherit'
    })
    .on('close', done);
});


// Rebuild Jekyll and reload page
gulp.task('jekyll:rebuild', ['jekyll:devbuild'], function () {
  browserSync.reload();
});


// Compile files from _scss into both _site/css (for live injecting)
// and site (for future jekyll builds)
gulp.task('sass', function () {
  return gulp
    .src(paths.sassDir + '*.scss')
    .pipe(sass({
        includePaths: [paths.sassDir]
      }))
    .on('error', sass.logError)
    .pipe(autoprefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
        cascade: true
      }))
    .pipe(gulp.dest(paths.siteDir + paths.cssDir))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest(paths.cssDir));
});


// Reload browsersync without rebuilding
gulp.task('reload', function () {
  browserSync.reload();
});


// Watch scss files for changes & recompile
// Watch html/md files, run jekyll & reload BrowserSync
gulp.task('watch', function () {
  gulp.watch(paths.sassDir + '**/*.scss', ['sass']);
  gulp.watch([
    '*.html',
    '_layouts/*.html',
    '_includes/**/*.html',
    '_posts/*.md',
    'assets/images/**/*',
    '*.yml'
  ], ['jekyll:rebuild']);
});


// Build site without starting server and watching for changes.
gulp.task('build', ['sass', 'jekyll:build']);


// Default task, running just `gulp` will compile the sass,
// compile the jekyll site, launch BrowserSync & watch files.
gulp.task('default', ['browser-sync', 'watch']);

//Github pages deploy
gulp.task('deploy', function() {
  return gulp.src('./_site/**/*')
    .pipe(ghPages());
});

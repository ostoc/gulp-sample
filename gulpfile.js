var gulp        = require('gulp'),
    sass        = require('gulp-sass'),
    rename      = require('gulp-rename'),
    cssmin      = require('gulp-clean-css'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    scsslint    = require('gulp-sass-lint'),
    cache       = require('gulp-cached'),
    prefix      = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    minifyHTML  = require('gulp-minify-html'),
    size        = require('gulp-size'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    plumber     = require('gulp-plumber'),
    deploy      = require('gulp-gh-pages'),
    notify      = require('gulp-notify');


gulp.task('scss', function() {
    var onError = function(err) {
      notify.onError({
          title:    "Gulp",
          subtitle: "Failure!",
          message:  "Error: <%= error.message %>",
          sound:    "Beep"
      })(err);
      this.emit('end');
  };

  return gulp.src('app/scss/main.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass())
    .pipe(size({ gzip: true, showFiles: true }))
    .pipe(prefix())
    .pipe(rename('main.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({stream:true}))
    .pipe(cssmin())
    .pipe(size({ gzip: true, showFiles: true }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "dist/"
        }
    });
});

gulp.task('vender-css', function(){
    return gulp.src('node_modules/bootstrap/dist/css/bootstrap.min.css')
    .pipe(rename('vender.css'))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('deploy', function () {
    return gulp.src('dist/**/*')
        .pipe(deploy());
});

gulp.task('js', function() {
  gulp.src(['node_modules/jquery/dist/jquery.min.js','node_modules/bootstrap/dist/js/bootstrap.min.js'])
  .pipe(concat('vender.js'))
  .pipe(size({ gzip: true, showFiles: true }))
  .pipe(gulp.dest('dist/scripts'));
  
  gulp.src('app/scripts/**/*.js')
    .pipe(uglify())
    .pipe(size({ gzip: true, showFiles: true }))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(reload({stream:true}));
});



gulp.task('scss-lint', function() {
  gulp.src('app/scss/**/*.scss')
    .pipe(cache('scsslint'))
    .pipe(scsslint());
});

gulp.task('html', function(){
    return gulp.src('app/**/*.html')
    .pipe(gulp.dest('dist/'));
});

gulp.task('minify-html', function() {
    var opts = {
      comments:false,
      spare:true
    };

  gulp.src('app/**/*.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('dist/'))
    .pipe(reload({stream:true}));
});

gulp.task('watch', function() {
  gulp.watch('app/scss/**/*.scss', ['scss']);
  gulp.watch('app/scripts/**/*.js', ['js']);
  gulp.watch('app/**/*.html', ['html']);
  gulp.watch('aap/images/*', ['imgmin']);
});

gulp.task('imgmin', function () {
    return gulp.src('app/images/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('serve', ['browser-sync', 'js', 'html', 'vender-css', 'scss', 'watch']);

gulp.task('dist', ['js','vender-css', 'imgmin', 'minify-html', 'scss']);

const { src, dest, watch, parallel, series } = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const concat = require('gulp-concat')
const browserSync = require('browser-sync')
const uglify = require('gulp-uglify-es').default
const autoPrefixer = require('gulp-autoprefixer')
const imagemin = import('gulp-imagemin')
const del = require('del')

function browserSyn() {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
  })
}

function cleanDist() {
  return del('dist')
}

function images() {
  return src('app/img/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest('dist/img'))
}

function scripts() {
  return src(['app/js/app.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styles() {
  return src('app/sass/style.scss')
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(concat('style.min.css'))
    .pipe(
      autoPrefixer({
        overrideBrowserslist: ['last 10 version'],
        grid: true,
      })
    )
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function watching() {
  watch(['app/sass/**/*.scss'], styles)
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts)
  watch(['app/*.html']).on('change', browserSync.reload)
}

function build() {
  return src(
    [
      'app/css/style.min.css',
      'app/fonts/**/*',
      'app/js/main.min.js',
      'app/*.html',
      'app/video/*.mp4',
      'app/audio/audio.mp3',
    ],
    { base: 'app' }
  ).pipe(dest('dist'))
}

exports.styles = styles
exports.watching = watching
exports.browserSync = browserSyn
exports.scripts = scripts
exports.images = images
exports.cleanDist = cleanDist

exports.build = series(cleanDist, images, build)
exports.default = parallel(styles, scripts, browserSyn, watching)

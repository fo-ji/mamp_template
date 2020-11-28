// gulpプラグイン
const gulp = require('gulp')
// Sassをコンパイルするプラグイン
const sass = require('gulp-sass')
// CSSに自動でベンダープレフィックスを付与するプラグイン
const prefix = require('gulp-autoprefixer')
// CSSのメディアクエリを整理してまとめるプラグイン
const query = require('gulp-group-css-media-queries')
// CSSのプロパティをソートするプラグイン
const comb = require('gulp-csscomb')
// 画像の圧縮を行うプラグイン
const imgmin = require('gulp-imagemin')
const svgmin = require('gulp-svgmin')
// ファイルの変更を監視するプラグイン
const changed = require('gulp-changed')
// エラーが発生しても監視が止まらないようにする
const plumber = require('gulp-plumber')
// エラー通知用プラグイン
const notify = require('gulp-notify')
// CSS Minifyプラグイン
const mincss = require('gulp-clean-css')

var browserSync = require('browser-sync') //ブラウザシンク
var ssi = require('connect-ssi') //ssi

// 保存先パスを指定
const paths = {
  srcDir: 'assets',
  distDir: 'src',
  scssDir: 'assets/scss',
  cssDir: 'src/css',
  simgDir: 'assets/img',
  imgDir: 'src/img',
  jsDir: 'src',
}

// SCSSコンパイル
gulp.task('gulp-sass', function () {
  return gulp
    .src(paths.scssDir + '/**/**.scss')
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(sass())
    .pipe(prefix(['last 1 versions', 'ie >= 11', 'Android >= 5.1']))
    .pipe(comb())
    .pipe(query())
    .pipe(gulp.dest(paths.cssDir))
})

// SCSSコンパイル
gulp.task('gulp-css-property', function () {
  return gulp
    .src(paths.scssDir + '/**/**.scss')
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(prefix(['last 1 versions', 'ie >= 11', 'Android >= 5.1']))
    .pipe(comb())
    .pipe(gulp.dest(paths.scssDir))
})

// 画像圧縮とコピー
gulp.task('img', function () {
  return gulp
    .src(paths.simgDir + '/**/*.+(jpg|jpeg|png|gif)')
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(changed(paths.imgDir))
    .pipe(gulp.dest(paths.imgDir))
})
gulp.task('svg', function () {
  return gulp
    .src(paths.simgDir + '/**/*.svg')
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(changed(paths.imgDir))
    .pipe(svgmin())
    .pipe(gulp.dest(paths.imgDir))
})
gulp.task('gulp-img', gulp.series('img', 'svg'))

// 処理を行わないファイルのコピー
gulp.task('jsCopy', function () {
  return gulp
  .src(['src/js/*.js'])
  .pipe(gulp.dest(paths.jsDir))
})

// CSS Minify
gulp.task('mincss', function () {
  return gulp
    .src(paths.scssDir + '/**/**.scss')
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(sass())
    .pipe(prefix(['last 1 versions', 'ie >= 11', 'Android >= 5.1']))
    .pipe(query())
    .pipe(mincss())
    .pipe(gulp.dest(paths.cssDir))
})

// ローカルサーバーの立ち上げ
const browserSyncOption = {
  port: 8080,
  server: {
    baseDir: paths.distDir, // ルートとなるディレクトリを指定
    port: 3001,
    middleware: [
      ssi({
        baseDir: paths.distDir,
        ext: '.html',
      }),
    ],
  },
  reloadOnRestart: true,
  startPath: 'index.html',
  open: 'external',
  notify: false,
}

function sync(done) {
  browserSync.init(browserSyncOption)
  done()
}

// watch&リロード 処理
function watchFiles(done) {
  const browserReload = () => {
    browserSync.reload()
    done()
  }
  gulp.watch(paths.srcDir + '/**/**.scss').on('change', gulp.series('gulp-sass', browserReload))
  gulp
    .watch(paths.srcDir + '/**/*.+(jpg|jpeg|png|gif|svg')
    .on('change', gulp.series('gulp-img', browserReload))
  gulp
    .watch([paths.srcDir + '/**/**.js'])
    .on('change', gulp.series('jsCopy', browserReload))
  //   gulp.watch(srcDir + '/**/*.scss').on('change', gulp.series('gulp-sass', browserReload))
  //   gulp.watch(srcDir + '/**/*.js').on('change', gulp.series('esLint', browserReload))
}

// ファイル監視
// gulp.task('watch', function () {
//   gulp.watch(paths.scssDir + '/**/**.scss', gulp.series('gulp-sass'))
//   gulp.watch(paths.simgDir + '/**/*.+(jpg|jpeg|png|gif)', gulp.series('gulp-img'))
//   gulp.watch(
//     [
//       paths.srcDir + '/**/**.**',
//       '!' + paths.srcDir + '/**/**.+(pug|scss|jpg|jpeg|png|gif|svg)',
//       '!' + paths.sjsDir + '/**/_*.js',
//     ],
//     gulp.series('gulp-copy')
//   )
// })
gulp.task('gulp-minify', gulp.series('mincss'))

// // default /////////////////////////////////////
// gulp.task('default', gulp.series('gulp-sass', 'gulp-img', 'gulp-copy', 'watch'))
gulp.task(
  'default',
  gulp.series(gulp.parallel('gulp-sass', 'gulp-img', 'jsCopy'), gulp.series(sync, watchFiles))
)
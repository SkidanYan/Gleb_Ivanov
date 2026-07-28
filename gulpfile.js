const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const { deleteAsync } = require('del');
const esbuild = require('esbuild');
const outputDirectory = 'build';

// 1. Очистка временной папки сборки
function clean() {
  return deleteAsync([outputDirectory]);
}

// 2. Сборка HTML
function html() {
  return gulp
    .src('src/index.html')
    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: '@file'
      })
    )
    .pipe(gulp.dest(outputDirectory));
}

// 3. Компиляция SCSS
function scss() {
  return gulp
    .src('src/scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(`${outputDirectory}/css`))
    .pipe(browserSync.stream());
}

// 4. Сборка TypeScript через esbuild
function typescript() {
  return esbuild.build({
    entryPoints: ['src/ts/main.ts'],
    bundle: true,
    outfile: `${outputDirectory}/js/main.js`,
    format: 'esm',
    target: 'es2020',
    sourcemap: true
  });
}

// 5. ИСПРАВЛЕННАЯ ФУНКЦИЯ КАРТИНКОВ: Явно возвращаем поток (return)
function imagesBase() {
  return gulp
    .src('src/images/**/*', { encoding: false }) // Отключаем текстовую кодировку для бинарных файлов (очень важно в Gulp 5)
    .pipe(gulp.dest(`${outputDirectory}/images`))
    .pipe(browserSync.stream());
}

function imagesServices() {
  return gulp
    .src('src/components/services/serviceImage/**/*.webp', { encoding: false })
    .pipe(gulp.dest(`${outputDirectory}/images/serviceImage`))
    .pipe(browserSync.stream());
}

function faviconRoot() {
  return gulp
    .src('src/images/favicons/favicon.ico', { encoding: false })
    .pipe(gulp.dest(outputDirectory))
    .pipe(browserSync.stream());
}

// 6. Локальный сервер
function serve(done) {
  browserSync.init({
    server: `./${outputDirectory}`,
    port: 3000,
    open: false
  });
  done();
}

// 7. Перезагрузка браузера
function reload(done) {
  browserSync.reload();
  done();
}

// 8. Слежение за файлами
function watchFiles() {
  gulp.watch('src/**/*.html', gulp.series(html, reload));
  gulp.watch('src/**/*.scss', scss);
  gulp.watch('src/**/*.ts', gulp.series(typescript, reload));
  gulp.watch('src/images/**/*', gulp.series(imagesBase, reload)); // Добавили перезагрузку при изменении картинок
  gulp.watch('src/components/services/serviceImage/**/*', gulp.series(imagesServices, reload));
  gulp.watch('src/images/favicons/favicon.ico', gulp.series(faviconRoot, reload));
}

// --- Сценарии ---

// Полная сборка (strict последовательность: сначала чистим, ПОТОМ копируем)
const build = gulp.series(
  clean,
  gulp.parallel(html, scss, typescript, imagesBase, imagesServices, faviconRoot)
);

// Режим разработки
const dev = gulp.series(
  build,
  serve,
  watchFiles
);

exports.clean = clean;
exports.html = html;
exports.scss = scss;
exports.typescript = typescript;
exports.images = gulp.parallel(imagesBase, imagesServices);
exports.imagesBase = imagesBase;
exports.imagesServices = imagesServices;
exports.faviconRoot = faviconRoot;
exports.build = build;
exports.dev = dev;
exports.default = dev;
'use strict';

// Определим необходимые инструменты
var gulp = require('gulp'),
    gp = require('gulp-load-plugins')(),
    include = require("posthtml-include"),
    fileinclude = require('gulp-file-include'),
    rsp = require('remove-svg-properties').stream,

    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),

    del = require("del"),
    browserSync = require('browser-sync').create();

// ЗАДАЧА: Компиляция CSS
gulp.task('styles', function() {
  return gulp.src('./source/sass/path/style.scss')         // какой файл компилировать
    .pipe(gp.plumber())                                   // отлавливаем ошибки
    .pipe(gp.sourcemaps.init())                              // инициируем карту кода
    .pipe(gp.sass())                                         // компилируем в CSS
    .pipe(gp.postcss([                                       // делаем постпроцессинг
      autoprefixer({ browsers: ['last 2 version'] }),     // автопрефиксирование
      mqpacker({ sort: true })                            // объединение медиавыражений
    ]))
    .pipe(gp.sourcemaps.write())
    .pipe(gulp.dest('./public/css'))                       // записываем CSS-файл
    .pipe(gp.csso())                                        // минифицируем CSS-файл
    .pipe(gp.rename({ suffix: '.min' }))                      // переименовываем CSS-файл
    .pipe(gulp.dest('./public/css'))                       // записываем CSS-файл
    .pipe(browserSync.stream());
});

// ЗАДАЧА: Сборка HTML
gulp.task('html:process', function() {
  return gulp.src('./source/*.html')                      // какие файлы обрабатывать
    .pipe(gp.plumber())
    .pipe(gp.posthtml([
      include()                                          // инлайнит спрайт
    ]))
    .pipe(fileinclude({                                   // обрабатываем gulp-file-include
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./public/'));                         // записываем файлы
});

// // ЗАДАЧА: Оптимизируем декоративные PNG, JPG, SVG
gulp.task('images:decor', function() {
  return gulp.src('./source/img/decoration/**/*.{png,jpg,jpeg,svg}')
  .pipe(gp.plumber())                                        // отлавливаем ошибки
  .pipe(gp.imagemin([
    gp.imagemin.jpegtran({progressive: true}),               // сжимаем PNG
    gp.imagemin.optipng({optimizationLevel: 3}),             // сжимаем PNG и определяем степень сжатия
    gp.imagemin.svgo()                                       // сжимаем SVG
  ]))
  .pipe(gulp.dest('./public/img/decoration'));               // записываем файлы
});

// ЗАДАЧА: Оптимизируем контентные PNG, JPG, SVG
gulp.task('images:content', function() {
  return gulp.src('./source/img/content/**/*.{png,jpg,jpeg,svg}')
  .pipe(gp.plumber())                                        // отлавливаем ошибки
  .pipe(gp.imagemin([
    gp.imagemin.jpegtran({progressive: true}),               // сжимаем PNG
    gp.imagemin.optipng({optimizationLevel: 3}),             // сжимаем PNG и определяем степень сжатия
    gp.imagemin.svgo()                                       // сжимаем SVG
  ]))
  .pipe(gulp.dest('./public/img/content'));               // записываем файлы
});

// ЗАДАЧА: Создаем файлы WEBP для хромиум-браузеров
// gulp.task('webp', function () {
//   return gulp.src('./source/img/content/**/*.{png,jpg}')  // какие файлы обрабатывать
//     .pipe(gp.plumber())                                      // отлавливаем ошибки
//     .pipe(gp.webp({quality: 80}))                            // конвертируем в webp и определяем степень сжатия
//     .pipe(gulp.dest('./public/img/content'));             // записываем файлы
// });

// ЗАДАЧА: Создаем SVG-спрайт
gulp.task('sprite', function () {
  return gulp.src('./source/img/sprite/*.svg')            // какие файлы обрабатывать
    .pipe(gp.plumber())                                      // отлавливаем ошибки
    .pipe(rsp.remove({                                     // удаляем атрибуты
        properties: [rsp.PROPS_FILL]
    }))
    .pipe(gp.svgstore({
      inlineSvg: true                                     // прописываем условие на тот случай, если будем инлайнить спрайт в html
    }))
    .pipe(gp.rename('sprite.svg'))                           // даем имя спрайту
    .pipe(gulp.dest('./public/img/'));                    // записываем файл
});

// ЗАДАЧА: Удаляем папку public
gulp.task('clean', function() {
  return del('./public');
});

gulp.task('copy', function() {
  return gulp.src([
    './source/fonts/**/*.otf',
    './source/img/**',
    './source/js/**',
    './source/*.html'
  ], {
    base: "./source"
  })
  .pipe(gulp.dest("./public"));
});

// ЗАДАЧА: Сборка всего и локальный сервер
gulp.task('serve', function() {
    browserSync.init({
      open: true,
      server: {
        baseDir: 'public/',
        index: 'photoalbum.html'
     }
    });
    browserSync.watch(['./public/**/*.*'], browserSync.reload);
  });

gulp.task('watch', function() {
    // $.gulp.watch('./source/js/**/*.js', $.gulp.series('js:process'));
    gulp.watch('./source/sass/**/*.scss', gulp.series('styles'));     // следим за CSS
    gulp.watch('./source/**/*.html', gulp.series('html:process'));  // следим за HTML
    gulp.watch('./source/img/content/**/*.*', gulp.series('images:content')); // следим за картинками
    gulp.watch('./source/img/decoration/**/*.*', gulp.series('images:decor')); // следим за картинками
    // gulp.watch('./source/img/content/**/*.*', gulp.series('webp')); // следим за картинками
    gulp.watch('./source/img/sprite/**/*.*', gulp.series('sprite')); // следим за спрайтом
  });

// ЗАДАЧА: Сборка всего и локальный сервер
gulp.task('default',
  gulp.series(
  'clean',
  'copy',
  'sprite',
  'html:process',
  gulp.parallel(
    'styles',
    'images:decor',
    'images:content'
    // 'webp',
  ),
  gulp.parallel(
    'watch',
    'serve'
  )
));

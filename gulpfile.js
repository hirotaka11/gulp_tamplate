// @file gulpfile.js

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
        pattern: ['gulp-*', 'gulp.*'],
        replaceString: /\bgulp[\-.]/
    }),
    browserSync = require("browser-sync"),
    rimraf = require('rimraf'),
    runSequence = require('run-sequence');;

var paths = {
    //"tplSrc": "tmp/*.jade",
    "scssSrc": "scss/**/*.scss",
    "cssSrc": "css/*.css",
    "jsSrc": "js/*.js",
    "imgSrc": "img/**",
    "scssDir": "scss/",
    "rootDir": "./",
    "imgDir": "dist/img/"
}

// $ gulp sass で実行するタスク
gulp.task('sass', function() {
    return $.rubySass(paths.scssDir, {
            style: 'expanded'
        })
        //エラー時にwatch終了を防ぐ
        .pipe($.plumber({
            //デスクトップ通知をする
            errorHandler: $.notify.onError('<%= error.message %>')
        }))
        //ベンダープレフィックス付加
        .pipe($.sourcemaps.init())
        .pipe($.pleeease({
            autoprefixer: {
                browsers: ['> 5%', 'last 2 version', 'Android 2.3']
            },
            minifier: false // minify無効
        }))
        // SourceMap output
        .pipe($.sourcemaps.write('./'))
        // css output
        .pipe(gulp.dest(paths.rootDir + 'css'))
        // Reload Browsers
        .pipe(browserSync.reload({
            stream: true,
            once: true
        }))
});

// Local Server Start
gulp.task('server', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});

// Reload Browsers
gulp.task('browser-reload', function() {
    browserSync.reload()
});

gulp.task('html', function() {
    return gulp.src('./**/*.html')
        .pipe($.if('*.html', $.minifyHtml()))
        .pipe(gulp.dest('dist'));
});

gulp.task('image', function() {
    return gulp.src(paths.imgSrc)
        .pipe($.newer(paths.imgDir))
        .pipe($.imagemin({
            optimizationLevel: 3
        }))
        .pipe(gulp.dest(paths.imgDir));
});

gulp.task('clean', function(cb) {
    rimraf('dist', cb);
});

// for production release
gulp.task('build', function(cb) {
    runSequence('clean', 'sass', ['html', 'image'], cb);
});


gulp.task('default', ['server'], function() {
    gulp.watch(paths.scssSrc, ['sass']);
    gulp.watch("./*.html", ['browser-reload']);
});

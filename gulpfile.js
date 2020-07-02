const gulp = require("gulp"),
    del = require("del"),
    buffer = require("vinyl-buffer"),
    imagemin = require("gulp-imagemin"),
    ttf2eot = require("gulp-ttf2eot"),
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    plumber = require("gulp-plumber"),
    babel = require("gulp-babel"),
    sourcemaps = require("gulp-sourcemaps"),
    sass = require("gulp-sass"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    gutil = require("gutil"),
    ftp = require("vinyl-ftp"),
    rsync = require('gulp-rsync'),
    browserSync = require("browser-sync").create();

// const conn = ftp.create({
//     host: "vh296.timeweb.ru",
//     port: 21,
//     user: "ci42086",
//     password: "VhcU1XN72xhr",
//     parallel: 1,
//     log: gutil.log,
// });
// const remoteLocation = "/dental/public_html";
// const localFiles = [
//     './dist/fonts/**',
//     './dist/css/**',
//     './dist/js/**',
//     './dist/images/**',
//     './dist/*.html'
// ];

// const deployTask = () => {
//     gulp
//         .src(localFiles, { base: "./dist", buffer: false })
//         .pipe(conn.newer(remoteLocation))
//         .pipe(conn.dest(remoteLocation));
//
//     return conn.clean('/dental/public_html/**/*', "./dist/")
// };


// const updateRemoteJsFiles = () => {
//     return gulp
//         .src(
//             [
//                 "./dist/js/*.js",
//                 "!./dist/js/vendor/**/*.js",
//             ],
//             { base: "./dist", buffer: false }
//         )
//         .pipe(conn.newer(remoteLocation))
//         .pipe(conn.dest(remoteLocation));
// };

// const updateRemoteCssFiles = () => {
//     return gulp
//         .src("./dist/css/*.css", { base: "./dist", buffer: false })
//         .pipe(conn.newer(remoteLocation))
//         .pipe(conn.dest(remoteLocation));
// };

// const updateRemoteHtmlFiles = () => {
//     conn.clean('/dental/public_html/**/*', "./dist/");
//
//     return gulp
//         .src("./dist/*.html", { base: "./dist", buffer: false })
//         .pipe(conn.newer(remoteLocation))
//         .pipe(conn.dest(remoteLocation));
// };

const cleanTask = (cb) => {
    const globs = [
        // "./dist",
        "C:/Program Files/Open_server/OSPanel/domains/yakimov-dental.ru/wp-content/themes/dental/assets",
        "C:/Program Files/Open_server/OSPanel/domains/yakimov-dental.ru/wp-content/themes/dental/style.css"
    ];
    return del(globs, {force: true}).then(() => {
        cb();
    });
};

const imgTask = () => {
    return gulp
        .src("./src/images/**/*")
        .pipe(buffer())
        .pipe(
            imagemin([
                imagemin.mozjpeg({
                    quality: 75,
                    progressive: true,
                }),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [{removeViewBox: true}, {cleanupIDs: false}],
                }),
            ])
        )
        .pipe(gulp.dest("./dist/images"))
        .pipe(gulp.dest("C:/Program Files/Open_server/OSPanel/domains/yakimov-dental.ru/wp-content/themes/dental/assets/images"));
};
//
// const copyHtml = () => {
//     return gulp.src("./src/*.html").pipe(gulp.dest("./dist"));
// };

const fontsTask = () => {
    gulp
        .src("./src/fonts/**/*.ttf")
        .pipe(ttf2woff())
        .pipe(gulp.dest("C:/Program Files/Open_server/OSPanel/domains/yakimov-dental.ru/wp-content/themes/dental/assets/fonts"));
    gulp
        .src("./src/fonts/**/*.ttf")
        .pipe(ttf2woff2())
        .pipe(gulp.dest("C:/Program Files/Open_server/OSPanel/domains/yakimov-dental.ru/wp-content/themes/dental/assets/fonts"));
    return gulp
        .src("./src/fonts/**/*.ttf")
        .pipe(ttf2eot({clone: true}))
        .pipe(gulp.dest("C:/Program Files/Open_server/OSPanel/domains/yakimov-dental.ru/wp-content/themes/dental/assets/fonts"));
};

const jsVendorTask = () => {
    return gulp.src("./src/js/vendor/*.js").pipe(gulp.dest("C:/Program Files/Open_server/OSPanel/domains/yakimov-dental.ru/wp-content/themes/dental/assets/js/vendor"));
};

const jsTask = () => {
    return gulp
        .src("./src/js/script.js")
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(
            babel({
                presets: ["@babel/env"],
            })
        )
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
        .pipe(gulp.dest("C:/Program Files/Open_server/OSPanel/domains/yakimov-dental.ru/wp-content/themes/dental/assets/js"));
};

const cssTask = () => {
    return gulp
        .src("./src/scss/style.scss")
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: "expanded"}))
        .pipe(postcss([autoprefixer({cascade: false})]))
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
        .pipe(gulp.dest("C:/Program Files/Open_server/OSPanel/domains/yakimov-dental.ru/wp-content/themes/dental"));
};

const reload = done => {
    browserSync.reload();
    done();
}

const watcherTask = () => {
    browserSync.init({
        // server: "./dist",
        proxy: 'http://yakimov-dental.ru/',
        notify: false,
        open: false,
    });

    gulp
        .watch("./src/fonts/**/*", gulp.series(fontsTask));

    gulp
        .watch("./src/images/**/*", gulp.series(imgTask));

    gulp.watch("./src/scss/**/*.scss", gulp.series(
        cssTask,
        // updateRemoteCssFiles,
        reload
    ));

    gulp
        .watch("./src/js/script.js", gulp.series(
            jsTask,
            // updateRemoteJsFiles,
            reload
        ));
        // .on("change", browserSync.reload);

    // gulp
    //     .watch("./src/*.html", gulp.series(
    //         () => del("./dist/*.html"),
    //         copyHtml,
    //         updateRemoteHtmlFiles,
    //         reload
    //     ));
};

exports.default = gulp.series(
    cleanTask,
    gulp.parallel(
        // copyHtml,
        fontsTask,
        jsVendorTask,
        imgTask,
        cssTask,
        jsTask
    ),
    // deployTask,
    watcherTask
);

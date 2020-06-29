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
    browserSync = require("browser-sync").create();

const conn = ftp.create({
    host: "vh296.timeweb.ru",
    port: 21,
    user: "ci42086",
    password: "VhcU1XN72xhr",
    parallel: 1,
    log: gutil.log,
});
const remoteLocation = "/dental/public_html";
const localFiles = [
    './dist/fonts/**',
    './dist/css/**',
    './dist/js/**',
    './dist/images/**',
    './dist/*.html'
];

const deployTask = () => {
    return gulp
        .src(localFiles, { base: "./dist", buffer: false })
        // .pipe(conn.newer(remoteLocation))
        .pipe(conn.dest(remoteLocation));
        // .pipe(conn.clean(remoteLocation + '/**', "./dist"));
};


const updateRemoteJsFiles = () => {
    return gulp
        .src(
            [
                "./dist/js/*.js",
                "!./dist/js/vendor/**/*.js",
            ],
            { base: "./dist", buffer: false }
        )
        .pipe(conn.newer(remoteLocation))
        .pipe(conn.dest(remoteLocation));
};

const updateRemoteCssFiles = () => {
    return gulp
        .src("./dist/css/*.css", { base: "./dist", buffer: false })
        .pipe(conn.newer(remoteLocation))
        .pipe(conn.dest(remoteLocation));
};

const updateRemoteHtmlFiles = () => {
    return gulp
        .src("./dist/*.html", { base: "./dist", buffer: false })
        .pipe(conn.newer(remoteLocation))
        .pipe(conn.dest(remoteLocation));
};

const cleanTask = (cb) => {
    return del("./dist").then(() => {
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
        .pipe(gulp.dest("./dist/images"));
};

const copyHtml = () => {
    return gulp.src("./src/*.html").pipe(gulp.dest("./dist"));
};

const fontsTask = () => {
    gulp
        .src("./src/fonts/**/*.ttf")
        .pipe(ttf2woff())
        .pipe(gulp.dest("./dist/fonts"));
    gulp
        .src("./src/fonts/**/*.ttf")
        .pipe(ttf2woff2())
        .pipe(gulp.dest("./dist/fonts"));
    return gulp
        .src("./src/fonts/**/*.ttf")
        .pipe(ttf2eot({clone: true}))
        .pipe(gulp.dest("./dist/fonts"));
};

const jsVendorTask = () => {
    return gulp.src("./src/js/vendor/*.js").pipe(gulp.dest("./dist/js/vendor"));
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
        .pipe(gulp.dest("./dist/js"));
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
        .pipe(gulp.dest("./dist/css"));
};

const reload = done => {
    browserSync.reload();
    done();
}

const watcherTask = () => {
    browserSync.init({
        // server: "./dist",
        proxy: 'http://ci42086.tmweb.ru/',
        notify: false,
        open: true,
    });

    gulp
        .watch("./src/fonts/**/*", gulp.series(fontsTask));

    gulp
        .watch("./src/images/**/*", gulp.series(imgTask));

    gulp.watch("./src/scss/**/*.scss", gulp.series(cssTask, updateRemoteCssFiles, reload));

    gulp
        .watch("./src/js/script.js", gulp.series(jsTask, updateRemoteJsFiles, reload));
        // .on("change", browserSync.reload);

    gulp
        .watch("./src/*.html", gulp.series(copyHtml, updateRemoteHtmlFiles, reload));
};

exports.default = gulp.series(
    cleanTask,
    gulp.parallel(
        copyHtml,
        fontsTask,
        jsVendorTask,
        imgTask,
        cssTask,
        jsTask
    ),
    deployTask,
    watcherTask
);

const gulp = require("gulp"),
    del = require("del"),
    buffer = require("vinyl-buffer"),
    imagemin = require("gulp-imagemin"),
    ttf2eot = require("gulp-ttf2eot"),
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    plumber = require("gulp-plumber"),
    babel = require("gulp-babel"),
    sass = require("gulp-sass"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    gutil = require("gutil"),
    ftp = require("vinyl-ftp"),
    browserSync = require("browser-sync").create();

const conn = ftp.create({
    host: "localhost",
    port: 21,
    user: "ftp",
    password: "ftp",
    parallel: 10,
    log: gutil.log,
});
const remoteLocation = "/dentist.loc";
const localFiles = ["./dist/**"];

const deployTask = () => {
    return gulp
        .src(localFiles, { base: "./dist", buffer: false })
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
        .src("./src/js/script.js", {sourcemaps: true})
        .pipe(plumber())
        .pipe(
            babel({
                presets: ["@babel/env"],
            })
        )
        .pipe(plumber.stop())
        .pipe(gulp.dest("./dist/js", {sourcemaps: true}));
};

const cssTask = () => {
    return gulp
        .src("./src/scss/style.scss", {sourcemaps: true})
        .pipe(plumber())
        .pipe(sass({outputStyle: "expanded"}))
        .pipe(postcss([autoprefixer({cascade: false})]))
        .pipe(plumber.stop())
        .pipe(gulp.dest("./dist/css", {sourcemaps: true}))
        .pipe(browserSync.stream());
};

const updateRemoteJsFiles = () => {
    return gulp
        .src(
            [
                "./dist/js/*.js",
                "!./dist/js/vendor.js",
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

const watcherTask = () => {
    browserSync.init({
        // server: "./dist",
        proxy: 'http://dentist.loc/',
        notify: false,
        open: true,
    });

    gulp
        .watch("./src/fonts/**/*", gulp.series(fontsTask))
        .on("change", browserSync.reload);

    gulp
        .watch("./src/images/**/*", gulp.series(imgTask))
        .on("change", browserSync.reload);

    gulp.watch("./src/scss/**/*.scss", gulp.series(cssTask, updateRemoteCssFiles));

    gulp
        .watch("./src/js/script.js", gulp.series(jsTask, updateRemoteJsFiles))
        .on("change", browserSync.reload);

    gulp
        .watch("./src/*.html", gulp.series(copyHtml, updateRemoteHtmlFiles))
        .on("change", browserSync.reload);
};

exports.default = gulp.series(
    cleanTask,
    gulp.parallel(copyHtml, fontsTask, jsVendorTask, imgTask, cssTask, jsTask),
    deployTask,
    watcherTask
);

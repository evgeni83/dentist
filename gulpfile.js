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
  browserSync = require("browser-sync").create();

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
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
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
    .pipe(ttf2eot({ clone: true }))
    .pipe(gulp.dest("./dist/fonts"));
};

const jsVendorTask = () => {
  return gulp.src("./src/js/vendor/*.js").pipe(gulp.dest("./dist/js/vendor"));
};

const jsTask = () => {
  return gulp
    .src("./src/js/script.js", { sourcemaps: true })
    .pipe(plumber())
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(plumber.stop())
    .pipe(gulp.dest("./dist/js", { sourcemaps: true }));
};

const cssTask = () => {
  return gulp
    .src("./src/scss/style.scss", { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(postcss([autoprefixer({ cascade: false })]))
    .pipe(plumber.stop())
    .pipe(gulp.dest("./dist/css", { sourcemaps: true }))
    .pipe(browserSync.stream());
};

const watcherTask = () => {
  browserSync.init({
    server: "./dist",
    notify: false,
    open: true,
  });

  gulp
    .watch("./src/fonts/**/*", gulp.series(fontsTask))
    .on("change", browserSync.reload);

  gulp
    .watch("./src/images/**/*", gulp.series(imgTask))
    .on("change", browserSync.reload);

  gulp.watch("./src/scss/**/*.scss", gulp.series(cssTask));

  gulp
    .watch("./src/js/script.js", gulp.series(jsTask))
    .on("change", browserSync.reload);

  gulp
    .watch("./src/*.html", gulp.series(copyHtml))
    .on("change", browserSync.reload);
};

exports.default = gulp.series(
  cleanTask,
  gulp.parallel(copyHtml, fontsTask, jsVendorTask, imgTask, cssTask, jsTask),
  watcherTask
);

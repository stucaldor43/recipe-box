var gulp = require("gulp");
var babel = require("gulp-babel");
var sass = require("gulp-sass");
var browserify = require("browserify");
var source = require("vinyl-source-stream");

gulp.task("browserify", function() {
    return browserify("build/js/index.js")
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(gulp.dest("public"));
});

gulp.task("es6ify", function() {
    return gulp.src('src/**/*.js')
    .pipe(babel({presets: ["es2015", "react"]}))
    .pipe(gulp.dest('build'));
});

gulp.task("sassify", function() {
    return gulp.src("src/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./"));
});

gulp.task("transferCss", function() {
    return gulp.src("src/**/*.css")
    .pipe(gulp.dest("build"));
});

gulp.task("replicateHtml", function() {
    return gulp.src("src/index.html")
    .pipe(gulp.dest("./"));
});

var watcher1 = gulp.watch("src/**/*.js", ["es6ify"]);
watcher1.on("change", function(e) {
    console.log(e.path + " was changed");
});
var watcher2 = gulp.watch("src/**/*.scss", ["sassify"]);
watcher2.on("change", function(e) {
    console.log(e.path + " was changed");
});
var watcher3 = gulp.watch("src/**/*.css", ["transferCss"]);
watcher3.on("change", function(e) {
    console.log(e.path + " was changed");
});
var watcher4 = gulp.watch("src/index.html", ["replicateHtml"]);
watcher4.on("change", function(e) {
    console.log(e.path + " was changed");
});
var watch5 = gulp.watch("build/js/**/*.js", ["browserify"]);
watch5.on("change", function(e) {
    console.log(e.path + " was changed");
});
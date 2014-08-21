var gulp=require('gulp'),
    gulputil=require('gulp-util'),
    path=require('path'),
    fs = require('fs-extra'),
    concat=require('gulp-concat'),
    uglify = require('gulp-uglify'),
    merge = require('merge-stream'),
    build=require('./build.json'),
    release=require('./build/dist.json'),
    src='./src',
    dist='./dist';




gulp.task('default',function(){
    console.log('elliptical-http build..."tasks: gulp build|gulp minify"');
});

gulp.task('build',function(){

    var build_=platformStream()
        .pipe(concat('elliptical-http.js'))
        .pipe(gulp.dest(src));

    var release_=releaseStream()
        .pipe(concat('elliptical-http.js'))
        .pipe(gulp.dest(dist));

    return merge(build_, release_);

});

gulp.task('minify',function(){

    var build_=platformStream()
        .pipe(concat('elliptical-http.js'))
        .pipe(gulp.dest(src));

    var minify_=releaseStream()
        .pipe(concat('elliptical-http.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dist));

    return merge(build_, minify_);
});

function platformStream(){
    return gulp.src(build);
}

function releaseStream(){
    return gulp.src(release);
}

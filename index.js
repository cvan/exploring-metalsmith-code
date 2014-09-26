var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var Handlebars = require('handlebars');
var templates = require('metalsmith-templates');
var path = require('path');
var fs = require('fs');

var ARTIFACT = 'artifact';
var PLATFORMS = {
    ios: '.plist',
    bb7: '.jad',
    bb10: '.bar',
    android: '.apk'
}

Metalsmith(__dirname)
    .destination('output')
    .use(function (files, metalsmith, done) {
        Object.keys(files).forEach(function (key) {
            var file = files[key];
            if (path.extname(key) === '.json') {
                file.config = JSON.parse(file.contents);
            }
        });
        done();
    })
    .use(function (files, metalsmith, done) {
        Object.keys(files).forEach(function (key) {
            var file = files[key];
            if (path.extname(key) === '.json') {
                var platforms = {};
                Object.keys(PLATFORMS).forEach(function(ext) {
                    var platform = files[ext];
                    var relativePath = path.join(path.dirname(key), ARTIFACT + ext);
                    var absolutePath = path.resolve(metalsmith.dir, metalsmith._src, relativePath);
                    if(fs.existsSync(absolutePath)) {
                        platforms[platform] = relativePath;
                    }
                });
                file.platforms = platforms;
            }
        });
        done();
    })
    .use(collections({
        builds: {
            pattern: 'builds/*/config.json'
        }
    }))
    .use(templates('handlebars'))
    .build(function(err, files) {
        console.log(files);
        if (err) throw err;
    });
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodewebkit: {
      options: {
        build_dir: './release', // target
        mac: true,
        win: false,
        linux32: false,
        linux64: false,
        version: '0.9.2'
      },
      src: ['./**/*'] // source
    },
    clean: {
      pre: ["build", "release/releases"],
      post: ["build"]
    },
    cssmin: {
      minify: {
        src: ["bower_components/bootstrap/dist/css/bootstrap.css",
          "bower_components/bootstrap/dist/css/bootstrap-theme.css",
          "bower_components/nprogress/nprogress.css",
          "app.css"
        ],
        dest: "build/app.min.css"
      },
      options: {
        keepSpecialComments: 0
      }
    },
    copy: {
      "build-templates": {
        files: [{
          expand: true,
          cwd: "build-templates/",
          src: ["*", "!*.html"],
          dest: "build/"
        }]
      }
    },
    uglify: {
      jsfiles: {
        files: {
          "build/app.client.min.js": [
            "bower_components/jquery/dist/jquery.js",
            "bower_components/bootstrap/dist/js/bootstrap.js",
            "bower_components/nprogress/nprogress.js",
            "nwClient.js"
          ]
        }
      }
    },
    htmlmin: { // Task
      build: { // Target
        options: { // Target options
          removeComments: true,
          collapseWhitespace: true
        },
        files: { // dest: source
          "build/index.html": "build-templates/index.html" 
        }
      }
    },
  });

  grunt.loadNpmTasks("grunt-node-webkit-builder");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-htmlmin");

  grunt.registerTask("default", ["clean:pre", "htmlmin", "cssmin", "copy", "uglify", "nodewebkit"]);
};
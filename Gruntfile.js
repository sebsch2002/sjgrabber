module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodewebkit: {
      options: {
        build_dir: './release', // target
        mac: true,
        win: true,
        linux32: false,
        linux64: false,
        version: '0.9.2',
        zip: true,
        mac_icns: "assets/SJ_logo.icns"
      },
      src: ['build/**/*'] // source
    },
    clean: {
      pre: ["build", "dist"],
      post: ["build"],
      postcompress: ["release/releases"]
    },
    cssmin: {
      minify: {
        src: ["bower_components/bootstrap/dist/css/bootstrap.css",
          "bower_components/bootstrap/dist/css/bootstrap-theme.css",
          "bower_components/nprogress/nprogress.css",
          "client/app.css"
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
      },
      "daemon": {
        files: [{
          expand: true,
          cwd: "daemon/",
          src: ["*"],
          dest: "build/daemon/"
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
            "client/app.js"
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
    "install-dependencies": {
      options: {
        cwd: "build/"
      }
    },
    compress: {
      mac: {
        options: {
          archive: "dist/SJgrapper_mac_v" + grunt.file.readJSON('package.json').version + ".zip",
          mode: 'zip'
        },
        files: [{
          expand: true,
          cwd: 'release/releases/SJgrapper/mac/',
          src: ['**'],
          dest: '',
        }]
      },
      win: {
        options: {
          archive: "dist/SJgrapper_win_v" + grunt.file.readJSON('package.json').version + ".zip",
          mode: 'zip'
        },
        files: [{
          expand: true,
          cwd: 'release/releases/SJgrapper/win/',
          src: ['**'],
          dest: '',
        }]
      }
    }
  });

  grunt.loadNpmTasks("grunt-node-webkit-builder");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-htmlmin");
  grunt.loadNpmTasks('grunt-install-dependencies');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask("default", ["clean:pre", "htmlmin", "cssmin", "copy",
    "uglify", "install-dependencies", "nodewebkit", "clean:post",
    "compress", "clean:postcompress"
  ]);
};
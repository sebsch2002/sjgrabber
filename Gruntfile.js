module.exports = function(grunt) {

  var pkgJSON = grunt.file.readJSON("package.json");
  var nwBuildVersion = "0.9.2";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodewebkit: {
      options: {
        build_dir: './release', // target
        mac: true,
        win: true,
        linux32: true,
        linux64: true,
        version: nwBuildVersion,
        zip: true,
        keep_nw: false,
        mac_icns: "assets/SJ_logo_mac.icns"
      },
      src: ['build/**/*'] // source
    },
    clean: {
      pre: ["build", "dist"],
      post: ["build", "release/releases"],
      "build-deps": ["build-templates/node_modules"]
    },
    cssmin: {
      minify: {
        src: ["bower_components/bootstrap/dist/css/bootstrap.css",
          "bower_components/bootstrap/dist/css/bootstrap-theme.css",
          "bower_components/nprogress/nprogress.css",
          "bower_components/font-awesome/css/font-awesome.css",
          "client/app.css"
        ],
        dest: "build/css/app.min.css"
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
          src: ["**", "!*.html"],
          dest: "build/"
        }]
      },
      "bower_fonts": {
        files: [{
          expand: true,
          cwd: "bower_components/font-awesome/fonts/",
          src: ["*"],
          dest: "build/fonts/"
        }]
      },
      "assets": {
        files: [{
          expand: true,
          cwd: "assets/",
          src: ["**", "!dev/**"],
          dest: "build/assets/"
        }]
      },
      "licenses": {
        files: [{
          src: ["README.txt", "LICENSE.txt"],
          dest: 'release/releases/' + pkgJSON.name + '/linux32/'
        }, {
          src: ["*.html"],
          cwd: "release/cache/linux32/" + nwBuildVersion + "/",
          expand: true,
          dest: 'release/releases/' + pkgJSON.name + '/linux32/'
        }, {
          src: ["README.txt", "LICENSE.txt"],
          dest: 'release/releases/' + pkgJSON.name + '/linux64/'
        }, {
          src: ["*.html"],
          cwd: "release/cache/linux64/" + nwBuildVersion + "/",
          expand: true,
          dest: 'release/releases/' + pkgJSON.name + '/linux64/'
        }, {
          src: ["README.txt", "LICENSE.txt"],
          dest: 'release/releases/' + pkgJSON.name + '/mac/'
        }, {
          src: ["*.html"],
          cwd: "release/cache/mac/" + nwBuildVersion + "/",
          expand: true,
          dest: 'release/releases/' + pkgJSON.name + '/mac/'
        }, {
          src: ["README.txt", "LICENSE.txt"],
          dest: 'release/releases/' + pkgJSON.name + '/win/'
        }, {
          src: ["*.html"],
          cwd: "release/cache/win/" + nwBuildVersion + "/",
          expand: true,
          dest: 'release/releases/' + pkgJSON.name + '/win/'
        }]
      }
    },
    uglify: {
      clientjs: {
        files: {
          "build/app.client.min.js": [
            "bower_components/jquery/dist/jquery.js",
            "bower_components/bootstrap/dist/js/bootstrap.js",
            "bower_components/nprogress/nprogress.js",
            "bower_components/handlebars/handlebars.runtime.js",
            "client/hbhelpers.js",
            "client/templates.js",
            "client/contextMenu.js",
            "client/app.js"
          ]
        },
        options: {
          compress: {
            drop_console: true,
            dead_code: true,
            global_defs: {
              "NWAPP_DEBUG": false,
              "process.NWAPP_DEBUG": false
            }
          }
        }
      },
      daemonjs: {
        files: [{
          expand: true,
          src: '**/*.js',
          dest: 'build/daemon',
          cwd: 'daemon'
        }],
        options: {
          compress: {
            drop_console: true,
            dead_code: true,
            global_defs: {
              "NWAPP_DEBUG": false,
              "process.NWAPP_DEBUG": false
            }
          }
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
        cwd: "build-templates/"
      }
    },
    compress: {
      mac: {
        options: {
          archive: "dist/" + pkgJSON.name + "_mac_v" + pkgJSON.version + ".zip",
          mode: 'zip'
        },
        files: [{
          expand: true,
          cwd: 'release/releases/' + pkgJSON.name + '/mac/',
          src: ['**'],
          dest: '',
        }]
      },
      win: {
        options: {
          archive: "dist/" + pkgJSON.name + "_win_v" + pkgJSON.version + ".zip",
          mode: 'zip'
        },
        files: [{
          expand: true,
          cwd: 'release/releases/' + pkgJSON.name + '/win/',
          src: ['**'],
          dest: '',
        }]
      },
      // nw: {
      //   options: {
      //     archive: "dist/" + pkgJSON.name + "_nw_v" + pkgJSON.version + ".zip",
      //     mode: 'zip'
      //   },
      //   files: [{
      //     expand: true,
      //     cwd: 'release/releases/' + pkgJSON.name + '/',
      //     src: ['*'],
      //     dest: '',
      //   }]
      // },
      linux32: {
        options: {
          archive: "dist/" + pkgJSON.name + "_linux32_v" + pkgJSON.version + ".zip",
          mode: 'zip'
        },
        files: [{
          expand: true,
          cwd: 'release/releases/' + pkgJSON.name + '/linux32/',
          src: ['**'],
          dest: '',
        }]
      },
      linux64: {
        options: {
          archive: "dist/" + pkgJSON.name + "_linux64_v" + pkgJSON.version + ".zip",
          mode: 'zip'
        },
        files: [{
          expand: true,
          cwd: 'release/releases/' + pkgJSON.name + '/linux64/',
          src: ['**'],
          dest: '',
        }]
      }
    },
    handlebars: {
      all: {
        files: {
          "client/templates.js": ["client/templates/**/*.hbs"]
        }
      },
      options: {
        namespace: 'NWAPP.Templates',
        processName: function(filePath) {
          return filePath.replace(/^client\/templates\//, '').replace(/\.hbs$/, '');
        },
        compilerOptions: {
          knownHelpers: {
            "paginate": true,
            "slice": true
          },
          knownHelpersOnly: true
        }
      }
    },
    watch: {
      templates: {
        files: 'client/templates/**/*.hbs',
        tasks: ['handlebars'],
        options: {
          interrupt: true,
        }
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
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask("default", ["clean:pre", "handlebars", "htmlmin", "cssmin",
    "uglify:clientjs", "install-dependencies",
    "copy:build-templates", "copy:bower_fonts", "copy:assets",
    "uglify:daemonjs", "nodewebkit", "copy:licenses", "compress", "clean:post"
  ]);
};
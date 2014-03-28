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
    }
  });

  grunt.loadNpmTasks('grunt-node-webkit-builder');

  grunt.registerTask("default", ["nodewebkit"]);
};
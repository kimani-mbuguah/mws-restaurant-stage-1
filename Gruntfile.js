module.exports = function(grunt) {

    grunt.initConfig({
      responsive_images: {
        dev: {
          options: {
            engine: 'im',
            sizes: [
              {
                width: 1366,
                quality: 30
              }
            ]
          },
          files: [{
            expand: true,
            cwd: './hod/',
            src: ['*.{gif,jpg,png}'],
            dest: './hod1/'
          }]
        }
      }
    });

    grunt.loadNpmTasks('grunt-responsive-images');
  
    grunt.registerTask('default', ['responsive_images']);
  };
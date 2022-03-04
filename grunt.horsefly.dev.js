module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				eqnull: true,
				browser: true,
				globals: {
					jQuery: true
				},
				laxbreak: true,
				multistr: true
			},
			gruntfile: {
				src: 'grunt.horsefly.dev.js'
			},
			all: [
				'js/helpers/*.js',
				'js/bases/*.js',
				'js/modules/*.js',
				'js/views/*.js',
				'js/modals/*.js'
			]
		},
		replace: {
			cachebust: {
				src: ['views_html/companies.dev.html'],
				dest: 'companies.html',
				replacements: [{
					from: '{timestamp}',
					to: (new Date()).getTime()
				}]
			}
		},
		concat: {
			options: {
				separator: '\n',
				stripBanners: true,
			},
			partials: {
				src: 'partials/dev/*.html',
				dest: 'tmpl/dev.html'
			},
			modules: {
				src: [
					'js/helpers/defines.js',
					'js/helpers/utils.js',
					'js/helpers/templates.js',
					'js/helpers/pubsub.js',
					'js/helpers/views.js',
					'js/helpers/baseConf.js',
					'js/bases/search.js',
					'js/views/search_build.js',
					'js/views/search_saved.js',
					'js/views/search_upload.js',
					'js/views/jobposts.js',
					'js/views/candidates.js',
					'js/views/profiles.js',
					'js/views/wammee.js',
					'js/bases/results.js',
					'js/views/results_list.js',
					'js/modules/selects.js',
					'js/modules/tags.js',
					'js/modules/map.js',
					'js/modules/locs.js',
					'js/modules/dropdownList.js',
					'js/modules/export.js',
					'js/modals/doLogout.js',
					'js/modals/loggedOut.js',
					'js/modals/deleteSearch.js',
					'js/modals/saveSearch.js',
					'js/modals/exportPDF.js'
				],
				dest: 'js/dist/modules.js'
			},
			libraries: {
				src: [
					'js/vendor/handlebars.js',
					'js/vendor/jquery-ui.js',
					'js/vendor/selectize.js',
					'js/vendor/highcharts/highcharts.min.js',
					'js/vendor/highcharts/treemap.min.js',
					'js/vendor/highcharts/exporting.min.js'
				],
				dest: 'js/dist/libraries.js'
			}
		},
		cssmin: {
			options: {
				mergeIntoShorthands: false,
				roundingPrecision: -1
			},
			target: {
				files: {
					'css/main.min.css': [
						'css/common/reset.css',
						'css/common/animation.css',
						'css/common/header.css',
						'css/common/structure.css',
						'css/common/clickable.css',
						'css/common/form.css',
						'css/modules/tabs.css',
						'css/modules/map.css',
						'css/modules/results.css',
						'css/common/mobile.css'
					]
				}
			}
		},
		watch: {
			scripts: {
				files: [
					'js/**/*.js',
					'!js/dist/*.js'
				],
				tasks: ['jshint', 'concat'],
				options: {
					spawn: false,
				}
			},
			css: {
				files : [
					'css/*.css',
					'!css.main.min.css'
				],
				tasks: ['cssmin']
			},
			gruntfile: {
				files: 'grunt.horsefly.dev.js',
				options: {
					reload: true
				}
  			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-text-replace');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'replace', 'concat', 'cssmin', 'watch']);
};
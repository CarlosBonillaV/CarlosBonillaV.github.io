module.exports = function(grunt) {

	var base = {
		uglify: {
			compress: {
				global_defs: {
					DEBUG: false
				},
				dead_code: true,
				drop_console: true
			}
		}
	};

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		replace: {
			cachebust: {
				src: ['views_html/companies.prod.html'],
				dest: 'companies.scala.html',
				replacements: [{
					from: '{timestamp}',
					to: (new Date()).getTime()
				}]
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
		concat: {
			options: {
				separator: '\n',
				stripBanners: true,
			},
			partials: {
				src: 'partials/prod/*.html',
				dest: 'tmpl/prod.html'
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
					'js/views/jobposts.js',
					'js/views/candidates.js',
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
		uglify: {
			detection: {
				options: {
					mangle : false,
					compress: base.uglify.compress
				},
				src: 'js/helpers/uad.js',
				dest: 'js/dist/uad.min.js'
			},
			startup: {
				options: {
					mangle : false,
					compress: base.uglify.compress,
					banner: '/*! <%= pkg.name %> - Horsefly Startup - ' +
							'<%= grunt.template.today("yyyy-mm-dd h:MM:ssTT") %> */\n'
				},
				src: 'js/startup.prod.js',
				dest: 'js/startup.min.js'
			},
			modules: {
				options: {
					mangle : false,
					compress: base.uglify.compress,
					banner: '/*! <%= pkg.name %> - Modules - ' +
							'<%= grunt.template.today("yyyy-mm-dd h:MM:ssTT") %> */\n'
				},
				src: 'js/dist/modules.js',
				dest: 'js/dist/modules.min.js'
			},
			libraries: {
				options: {
					mangle : false,
					banner: '/*! <%= pkg.name %> - Libraries - ' +
							'<%= grunt.template.today("yyyy-mm-dd h:MM:ssTT") %> */\n'
				},
				src: 'js/dist/libraries.js',
				dest: 'js/dist/libraries.min.js'
			},
			report: {
				options: {
					mangle : false,
					banner: '/*! <%= pkg.name %> - PDF Report - ' +
							'<%= grunt.template.today("yyyy-mm-dd h:MM:ssTT") %> */\n'
				},
				src: 'js/views/report.js',
				dest: 'js/dist/report.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-text-replace');

	// Default task(s).
	grunt.registerTask('default', ['replace', 'cssmin', 'concat', 'uglify']);
};
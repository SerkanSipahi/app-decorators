module.exports = function (config) {

	config.set({
		basePath: './dist',
		frameworks: [
			'jspm',
			'mocha',
			'sinon',
			'should',
		],
		plugins: [
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-opera-launcher',
			//'karma-safari-launcher',
			'karma-mocha',
			'karma-sinon',
			'karma-should',
			'karma-jspm',
	    ],
		browsers: [
			'Chrome',
			'ChromeCanary',
			'Firefox',
			'Opera',
			//'Safari',
			'FirefoxEnableWebComponents',
		],
		customLaunchers: {
		    FirefoxEnableWebComponents: {
		        base: 'Firefox',
		        prefs: {
		            'dom.webcomponents.enabled': true
		        }
		    },
			Chrome_travis_ci: {
	          base: 'Chrome',
	          flags: ['--no-sandbox']
		  },
		},
		files: [{
	        pattern: '**/*.js.map',
	        included: false
		}],
		jspm: {

			browser: "jspm.browser.js",
			config: "jspm.config.js",

		    loadFiles: [
				'test/decorators/*spec.js',
				'test/libs/*spec.js',
				'test/helpers/*spec.js',
				'test/imports/*.js',
				'test/mocks/*.js',
			],
			serveFiles: [
				// internal libs/files
				'src/bootstrap.js',
				'src/index.js',
				'src/decorators/*.js',
				'src/libs/*.js',
				'src/helpers/*.js',
				'src/configs/*.js',
				'src/apps/*.js',
				'src/datas/*.js',
				// external libs/files
				'node_modules/core-js/**/*.js',
				'node_modules/handlebars/dist/handlebars.js',
				'node_modules/webcomponents.js/webcomponents-lite.js',
				'node_modules/xregexp/src/index.js',
				'node_modules/xregexp/src/**/*.js',
			]
		},
		autoWatch: true,
		singleRun: false,
		port: 9876,
	    colors: true,
	    logLevel: config.LOG_INFO,
	});

	if(process.env.TRAVIS){
        config.browsers = ['Chrome_travis_ci'];
    }

};

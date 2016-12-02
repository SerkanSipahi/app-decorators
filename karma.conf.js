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
		/*
		client: {
			mocha: {
				opts: 'test/mocha.opts' // update to karma-mocha 1.3.0
			},
		},
		*/
		jspm: {

			browser: "jspm.browser.js",
			config: "jspm.config.js",

		    loadFiles: [
				'jspm_packages/npm/babel-polyfill@6.16.0/dist/polyfill.js',

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
				'jspm_packages/npm/regenerator-runtime@0.9.6/**/*.js',
				'jspm_packages/npm/babel-runtime@6.18.0/**/*.js',
				'jspm_packages/npm/core-js@2.4.1/**/*.js',

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

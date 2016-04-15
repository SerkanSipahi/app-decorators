module.exports = function (config) {

	config.set({
		basePath: './',
		frameworks: [
			'jspm',
			'mocha',
			'sinon',
			'should',
		],
		plugins: [
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-safari-launcher',
			'karma-mocha',
			'karma-sinon',
			'karma-should',
			'karma-jspm',
	    ],
		browsers: [
			'Chrome',
			'ChromeCanary',
			'Firefox',
			'Safari',
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
		jspm: {

			browser: "jspm.browser.js",
			config: "jspm.config.js",

		    loadFiles: [
				'test/decorators/*spec.js',
				'test/libs/*spec.js',
				'test/helpers/*spec.js',
				'test/imports/*.js',
			],
			serveFiles: [
				// internal libs/files
				'src/bootstrap.js',
				'src/app-decorators.js',
				'src/decorators/*.js',
				'src/libs/*.js',
				'src/helpers/*.js',
				'src/datas/*.js',
				'src/apps/*.js',
				// external libs/files
				'jspm_packages/github/components/handlebars.js@4.0.5/handlebars.js',
				'jspm_packages/npm/immutable@3.7.6/dist/immutable.js',
				'jspm_packages/npm/should@8.2.1/lib/should.js',

				'node_modules/core-js/**/*.js',
				'node_modules/handlebars/dist/handlebars.js',
				'node_modules/immutable/dist/immutable.js',
				'node_modules/webcomponents.js/webcomponents-lite.js',
				'node_modules/pouchdb/dist/pouchdb.js',
				'node_modules/bluebird/js/browser/bluebird.js',
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

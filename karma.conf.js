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
			'karma-mocha',
			'karma-sinon',
			'karma-should',
			'karma-jspm',
	    ],
		browsers: [
			'Chrome',
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
		    loadFiles: [
				'test/decorators/*spec.js',
				'test/libs/*spec.js',
				'test/helpers/*spec.js',
				'test/imports/*.js',
			],
			serveFiles: [
				// internal libs/files
				'src/app-decorators.js',
				'src/decorators/*.js',
				'src/libs/*.js',
				'src/helpers/*.js',
				// external libs/files
				'jspm_packages/github/components/handlebars.js@4.0.5/handlebars.js',
				'jspm_packages/npm/immutable@3.7.6/dist/immutable.js',
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

module.exports = function (config) {

	config.set({
		basePath: './',
		frameworks: [
			'jspm',
			'mocha',
			'sinon',
			'should-promised',
			'should-sinon',
			'should',
		],
		plugins: [
			'karma-should-promised',
			'karma-should-sinon',
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
				// internal libs/files
				'src/app-decorators.js',
				'src/decorators/*.js',
				'src/libs/*.js',
				'src/helper/*.js',
				'test/decorators/*spec.js',
				'test/libs/*spec.js',
				// external libs/files
				'jspm_packages/github/components/handlebars.js@4.0.5/handlebars.js',
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

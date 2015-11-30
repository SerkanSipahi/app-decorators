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
		    }
		},
		jspm: {
		    loadFiles: [
				'src/**/*.js',
				'test/decorators/*.js',
				'test/libs/*.js'
			]
		},
		autoWatch: true,
		singleRun: false,
		port: 9876,
	    colors: true,
	    logLevel: config.LOG_INFO,
	});
};

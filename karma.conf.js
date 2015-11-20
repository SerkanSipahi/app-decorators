module.exports = function (config) {
	config.set({
		basePath: './',
		frameworks: [
			'jspm',
			'mocha',
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
			'karma-should',
			'karma-jspm',
	    ],
		browsers: [
			'Chrome',
			'Firefox',
		],
		jspm: {
		    loadFiles: ['src/**/*.js', 'test/**/*.js']
		},
		autoWatch: true,
		singleRun: false,
		port: 9876,
	    colors: true,
	    logLevel: config.LOG_INFO,
	});
};

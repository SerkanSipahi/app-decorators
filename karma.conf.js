module.exports = function (config) {
	config.set({
		basePath: './',
		frameworks: [
			'mocha',
			'should-promised',
			'should-sinon',
			'should',
		],
		plugins: [
			'karma-babel-preprocessor',
			'karma-should-promised',
			'karma-should-sinon',
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-mocha',
			'karma-should',
	    ],
		browsers: [
			'Chrome',
			// 'Firefox',
		],
		files: [
			'node_modules/babel-polyfill/dist/polyfill.js',
			'node_modules/systemjs/dist/system.src.js',
			'system.config.js',
			'src/*.js',
			'test/*.js',
	    ],
		preprocessors: {
		  'src/**/*.js': ['babel'],
		  'test/**/*.js': ['babel'],
		},
		babelPreprocessor: {
			options: {
				plugins: [
					"transform-es2015-modules-systemjs",
					"transform-regenerator"
				],
				presets: [
					'es2015',
					'stage-0',
					'stage-1',
					'stage-2',
					'stage-3'
				],
				sourceMap: 'inline',
			},
			filename: function (file) {
				return file.originalPath.replace(/\.js$/, '.es5.js');
			},
			sourceFileName: function (file) {
				return file.originalPath;
			},
		},
		autoWatch: true,
		singleRun: false,
		port: 9876,
	    colors: true,
	    logLevel: config.LOG_DEBUG,
	});
};

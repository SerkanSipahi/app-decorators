module.exports = function (config) {

	config.set({
		basePath: './packages/app-decorators',

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
			'karma-safari-launcher',
			//'karma-opera-launcher',
	    ],
		browsers: [
			'Chrome',
			'ChromeCanary',
			'Firefox',
			'Safari',
			//'Opera',
			//'FirefoxEnableWebComponents',
		],
		customLaunchers: {
		    FirefoxEnableWebComponents: {
		        base: 'Firefox',
		        prefs: {
		            'dom.webcomponents.enabled': true
		        }
		    },
		},
		files: [
			{pattern: '**/*.js.map', included: false},
		],
		client: {
			mocha: {
                opts: './mocha.opts',
				timeout: 60000,
			},
		},
		jspm: {

			browser: "tmp/jspm.browser.js",
			config: "tmp/jspm.config.js",

		    loadFiles: [
				// includes regenerator-runtime: useful for async await
				'jspm_packages/npm/babel-polyfill*/dist/polyfill.js',

				'test/decorators/*spec.js',
				'test/libs/*spec.js',
				'test/helpers/*spec.js',
				'test/imports/*.js',
				'test/mocks/*.js',

                '!test/libs/pipe.spec.js',
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

				'node_modules/@webcomponents/shadydom/shadydom.min.js',
				'node_modules/core-js/**/*.js',
				'node_modules/handlebars/dist/**/*.js',
				'node_modules/webcomponents.js/webcomponents-lite.js',
				'node_modules/named-js-regexp/lib/named-js-regexp.js',
				'node_modules/extend/index.js',
				'node_modules/underscore/underscore-min.js',
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

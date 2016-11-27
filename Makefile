default:
	@echo ""
	@echo "Available Targets:"
	@echo ""
	@echo "   make install"
	@echo "   make compile"
	@echo "   make test"
	@echo "   make clean"
	@echo "   make publish (npm)"
	@echo ""

install: clean clean-dist node_modules jspm_packages

compile: prepare-compile gulp-compile-watch

publish: prepare-compile gulp-compile npm-publish

node_modules:
	npm install; npm run postinstall;

jspm_packages:
	$(jspm) install

gulp-compile:
	$(gulp) compile;

gulp-compile-watch:
	$(gulp) compile-watch;

test:
	$(karma) start

clean:
	rm -rf node_modules jspm_packages

clean-dist:
	rm -rf dist

prepare-compile:
	rm -rf dist; mkdir dist; cd dist; \
	ln -s ../jspm_packages jspm_packages; \
	ln -s ../node_modules node_modules; \
	cd ..; \
	cp jspm.browser.js jspm.config.js dist; \

npm-publish:
	rm -rf lib; mkdir lib; \
	cp -r dist/src/ lib; \
	npm publish . &&  \
	rm -rf lib;

jspm  = ./node_modules/.bin/jspm
karma = ./node_modules/.bin/karma
gulp  = ./node_modules/.bin/gulp

.PHONY: install test clean node_modules jspm_packages compile test;
MAKEFLAGS = -s

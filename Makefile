
default:
	@echo ""
	@echo "Available Targets:"
	@echo ""
	@echo "   make install"
	@echo "   make compile"
	@echo "   make test"
	@echo "   make clean"
	@echo ""

install: clean node_modules jspm_packages

clean:
	rm -rf node_modules jspm_packages

node_modules:
	npm install

jspm_packages:
	$(jspm) install

compile:
	rm -rf dist; mkdir dist; cd dist; \
	ln -s ../jspm_packages jspm_packages; \
	ln -s ../node_modules node_modules; \
	cd ..; \
	cp jspm.browser.js jspm.config.js dist; \
	$(gulp) test;

test:
	$(karma) start

jspm  = ./node_modules/.bin/jspm
karma = ./node_modules/.bin/karma
gulp  = ./node_modules/.bin/gulp

.PHONY: install test clean node_modules jspm_packages compile test;
MAKEFLAGS = -s

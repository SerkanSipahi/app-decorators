default:
	@echo ""
	@echo "Available Targets:"
	@echo ""
	@echo "   make start"
	@echo "   make compile"
	@echo "   make clean"
	@echo "   make test"
	@echo ""

install: npm-install-packages jspm-install-packages

production: prepare-compile compile bundle-app

dev: prepare-compile gulp-compile

compile: prepare-compile
	$(babel) src --out-dir lib

gulp-compile: prepare-compile
	$(gulp) compile

gulp-compile-watch: prepare-compile
	$(gulp) compile-watch

server:
	node index.js

bundle-app:
	$(jspm) bundle lib/app - app-decorators dist/lib/app.js \
	--skip-source-maps \
	--minify;

npm-install-packages:
	npm install

jspm-install-packages:
	$(jspm) install

clean:
	make clean-dist; rm -rf node_modules jspm_packages

clean-dist:
	rm -rf dist lib;

prepare-compile: clean-dist
	mkdir -p dist; \
	cp index.html dist; \
	cd dist; \
	ln -sf ../jspm_packages jspm_packages; \
	ln -sf ../node_modules node_modules; \
	cd ..;

babel = ./node_modules/.bin/babel
gulp  = ./node_modules/.bin/gulp
jspm  = ./node_modules/.bin/jspm

.PHONY: compile compile-watch live production bundle-app server prepare-compile;
MAKEFLAGS = -s

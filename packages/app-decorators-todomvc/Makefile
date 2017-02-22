default:
	@echo ""
	@echo "Available Targets:"
	@echo ""
	@echo "   make start"
	@echo "   make compile"
	@echo "   make clean"
	@echo "   make test"
	@echo ""

compile:
	$(babel) src --out-dir lib

start: bundle start-express

bundle: prepare-compile compile bundle-app bundle-core

bundle-app:
	$(jspm) bundle src/app-todomvc - app-decorators dist/lib/app-todomvc.js \
	--minify \
	--skip-source-maps;

bundle-core:
	$(jspm) bundle app-decorators dist/app-decorators.js \
	--minify \
	--skip-source-maps;

start-express:
	node index.js

clean:
	make clean-dist; rm -rf node_modules jspm_packages

clean-dist:
	rm -rf dist

prepare-compile: clean-dist
	mkdir -p dist; \
	cp index.html dist; \
	cd dist; \
	ln -sf ../jspm_packages jspm_packages; \
	ln -sf ../node_modules node_modules; \
	cd ..;

babel = ./../../node_modules/.bin/babel
gulp  = ./../../node_modules/.bin/gulp
jspm  = ./../../node_modules/.bin/jspm

.PHONY: compile start bundle bundle-app bundle-core start-express a b;
MAKEFLAGS = -s

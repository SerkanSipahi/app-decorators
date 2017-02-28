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

live: prepare-compile compile bundle-app bundle-core start-express

dev: prepare-compile compile-watch bundle-app bundle-core start-express

compile:
	$(babel) src --out-dir lib

compile-watch:
	$(babel) src --out-dir lib -w

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

npm-install-packages:
	npm install

jspm-install-packages:
	$(jspm) install

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

babel = ./node_modules/.bin/babel
gulp  = ./node_modules/.bin/gulp
jspm  = ./node_modules/.bin/jspm

.PHONY: compile compile-watch live production bundle-app bundle-core start-express;
MAKEFLAGS = -s

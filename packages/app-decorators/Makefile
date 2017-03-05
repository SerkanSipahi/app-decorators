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

live: prepare-compile compile

dev: prepare-compile compile-watch

test:
	$(karma) start ../../karma.conf.js --single-run

compile: prepare-compile
	$(babel) src --out-dir lib

compile-watch: prepare-compile
	$(gulp) compile-watch

server:
	node index.js

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
karma = ./../../node_modules/.bin/karma

.PHONY: compile compile-watch live production bundle-app server prepare-compile;
MAKEFLAGS = -s

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
	@echo "   lerna-test"
	@echo "   lerna-clean"
	@echo "   lerna-publish"
	@echo "   lerna-publish-version version=1.0.0"
	@echo "   lerna-updated"
	@echo "   lerna-ncu"
	@echo "   lerna-ncu-update"
	@echo "   lerna-npm-install-save module=underscore"
	@echo "   lerna-npm-install-save-dev module=app-decorators"
	@echo ""

install: jspm-install-packages prepare-compile gulp-compile

compile: prepare-compile gulp-compile-watch

publish: lerna-publish

node_modules:
	npm install --no-package-lock

jspm-install-packages:
	$(jspm) install

gulp-compile:
	$(gulp) compile;

gulp-compile-watch:
	$(gulp) compile-watch;

lerna-init:
	lerna init $(set);

lerna-publish-version:
	lerna publish --repo-version $(version) --exact --force-publish=* $(set);

lerna-publish:
	make bundle-runtime && lerna publish --exact --force-publish=* $(set);

lerna-updated:
	lerna updated $(set);

lerna-ncu:
	lerna exec -- ncu;

lerna-ncu-update:
	lerna exec -- ncu -u;

lerna-npm-install-save:
	lerna exec -- npm install $(module) --save;

lerna-npm-install-save-dev:
	lerna exec -- npm install $(module) --save-dev;

lerna-clean:
	command -v lerna >/dev/null && lerna clean --yes;

lerna-test:
	lerna run test

lerna-bootstrap:
	lerna bootstrap -- --no-package-lock;

bundle-runtime:
	$(jspm) bundle app-decorators packages/app-decorators/runtime.js \
	--config build-runtime.json \
	--minify \
	--skip-source-maps;

test:
	$(karma) start

clean:
	rm -rf node_modules jspm_packages; \
	make clean-package-compiled;

clean-package-compiled:
	rm -rf packages/*/{lib,dist}; \
	rm -rf packages/app-decorators/{build,dist,tmp,src,test,node_modules,jspm_packages};

start-asset-css-server:
	node test/fixture/server-styles-4000.js

prepare-compile:
	rm -rf packages/app-decorators/{lib,src,test,tmp}; \
	mkdir -p packages/app-decorators/tmp; \
	cp jspm.browser.js jspm.config.js packages/app-decorators/tmp; \
	make start-asset-css-server;

fix-nested-node_modules:
	rm -rf packages/app-decorators/node_modules/node_modules;

jspm  = ./node_modules/.bin/jspm
karma = ./node_modules/.bin/karma
gulp  = ./node_modules/.bin/gulp

.PHONY: install test clean node_modules jspm-install-packages compile test lerna-init lerna-publish;
MAKEFLAGS = -s

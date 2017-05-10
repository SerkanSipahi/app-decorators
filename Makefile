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

install: node_modules jspm-install-packages prepare-compile gulp-compile

compile: prepare-compile gulp-compile-watch

publish: lerna-publish

node_modules:
	npm install

jspm-install-packages:
	$(jspm) install

gulp-compile:
	$(gulp) compile;

gulp-compile-watch:
	$(gulp) compile-watch;

lerna-init:
	$(lerna) init $(set);

lerna-publish-version:
	$(lerna) publish --repo-version $(version) --exact --force-publish=* $(set);

lerna-publish:
	$(lerna) publish --exact --force-publish=* $(set);

lerna-updated:
	$(lerna) updated $(set);

lerna-ncu:
	$(lerna) exec -- ncu;

lerna-ncu-update:
	$(lerna) exec -- ncu -u;

lerna-npm-install-save:
	$(lerna) exec -- npm install $(module) --save;

lerna-npm-install-save-dev:
	$(lerna) exec -- npm install $(module) --save-dev;

lerna-clean:
	command -v $(lerna) >/dev/null && $(lerna) clean --yes $(set);

lerna-test:
	$(lerna) run test --ignore={babel-preset-app-decorators,app-decorators,app-decorators-todomvc,app-decorators-cli-deps}

lerna-bootstrap:
	make fix-nested-node_modules; \
	$(lerna) bootstrap --ignore=app-decorators-cli-deps; \
	make fix-nested-node_modules;

bundle-runtime:
	$(jspm) bundle app-decorators packages/app-decorators/runtime.js \
	--config build-runtime.json \
	--minify \
	--skip-source-maps;

test:
	$(karma) start

clean:
	make lerna-clean; \
	rm -rf node_modules jspm_packages; \
	make clean-package-compiled;

clean-package-compiled:
	rm -rf packages/*/lib; \
	rm -rf packages/app-decorators/{build,dist,tmp,src,test,node_modules,jspm_packages};

prepare-compile:
	mkdir -p packages/app-decorators/tmp;
	cp jspm.browser.js jspm.config.js packages/app-decorators/tmp; \
	cd packages/app-decorators; \
	ln -sf ../../jspm_packages jspm_packages; \
	ln -sf ../../node_modules node_modules; \
	cd ../../; \
	make fix-nested-node_modules;

fix-nested-node_modules:
	rm -rf packages/app-decorators/node_modules/node_modules;

jspm  = ./node_modules/.bin/jspm
karma = ./node_modules/.bin/karma
gulp  = ./node_modules/.bin/gulp
lerna = ./node_modules/.bin/lerna

.PHONY: install test clean node_modules jspm-install-packages compile test lerna-init lerna-publish;
MAKEFLAGS = -s

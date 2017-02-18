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

install: node_modules jspm-install-packages lerna-bootstrap

compile: prepare-compile gulp-compile-watch

publish: lerna-publish

node_modules:
	npm install; npm run postinstall

jspm-install-packages:
	$(jspm) install

gulp-compile:
	$(gulp) compile;

gulp-compile-watch:
	$(gulp) compile-watch;

lerna-init:
	$(lerna) init $(set);

lerna-bootstrap:
	$(lerna) bootstrap $(set)

lerna-publish-version:
	$(lerna) publish --repo-version $(version) --exact --force-publish=* $(set);

lerna-publish:
	$(lerna) publish --exact --force-publish=* $(set);

lerna-updated:
	$(lerna) updated $(set);

lerna-clean:
	command -v $(lerna) >/dev/null && $(lerna) clean --yes $(set);

lerna-test:
	$(lerna) run test --ignore=babel-preset-app-decorators

test:
	$(karma) start

clean:
	make lerna-clean; \
	rm -rf node_modules jspm_packages; \
	make clean-package-compiled;

clean-package-compiled:
	rm -rf packages/*/lib; \
	rm -rf packages/app-decorators/{build,tmp,src,test,node_modules,jspm_packages};

prepare-compile:
	mkdir -p packages/app-decorators/{build,tmp};
	cp jspm.browser.js jspm.config.js packages/app-decorators/tmp; \
	cd packages/app-decorators; \
	ln -sf ../../jspm_packages jspm_packages; \
	ln -sf ../../node_modules node_modules; \
	cd ../../;

jspm   = ./node_modules/.bin/jspm
karma  = ./node_modules/.bin/karma
gulp   = ./node_modules/.bin/gulp
lerna  = ./node_modules/.bin/lerna

.PHONY: install test clean node_modules jspm-install-packages compile test lerna-init lerna-bootstrap lerna-publish;
MAKEFLAGS = -s

default:
	@echo ""
	@echo "Available Targets:"
	@echo ""
	@echo "   make test"
	@echo "   make build"
	@echo ""

test:
	$(karma) start ../../karma.conf.js --single-run

build:
	$(jspm) bundle app-decorators build/app-decorators.js \
	--config build.json \
	--minify

karma     = ./../../node_modules/.bin/karma
jspm      = ./../../node_modules/.bin/jspm

.PHONY: test compile build;
MAKEFLAGS = -s

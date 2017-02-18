default:
	@echo ""
	@echo "Available Targets:"
	@echo ""
	@echo "   make test"
	@echo ""

test:
	$(karma) start ../../karma.conf.js --single-run

compile:
	echo "compile";

build:
	echo "build";

karma = ./../../node_modules/.bin/karma

.PHONY: test compile build;
MAKEFLAGS = -s


default:
	@echo ""
	@echo "Available Targets:"
	@echo ""
	@echo "   make install"
	@echo "   make test"
	@echo "   make clean"
	@echo ""

install: node_modules jspm_packages

node_modules:
	npm install

jspm_packages:
	$(jspm) install

test: node_modules jspm_packages
	$(karma) start

clean:
	rm -rf node_modules jspm_packages

jspm  = ./node_modules/.bin/jspm
karma = ./node_modules/.bin/karma

.PHONY: install test clean;
MAKEFLAGS = -s

default:
	@echo ""
	@echo "Available Targets:"
	@echo ""
	@echo "   make test"
	@echo "   make compile"
	@echo ""

test:
	$(babel-node) $(mocha) -- test

compile:
	$(babel) src -d lib;

babel      = ./node_modules/.bin/babel
babel-node = ./node_modules/.bin/babel-node
mocha      = ./node_modules/.bin/_mocha

.PHONY: test compile;
MAKEFLAGS = -s

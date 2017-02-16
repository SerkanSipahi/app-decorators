default:
	@echo ""
	@echo "Available Targets:"
	@echo ""
	@echo "   make install"
	@echo "   make test"
	@echo "   make publish (npm)"
	@echo "   make clean (remove node_modules and libs/*)"
	@echo ""

install: clean node_modules

clean:
	rm -rf node_modules; rm -rf lib/*

publish: compile npm-publish

node_modules:
	npm install

test:
	$(babel-node) $(mocha) -- test

compile:
	$(babel) src -d lib;

npm-publish:
	npm publish

babel      = ./node_modules/.bin/babel
babel-node = ./node_modules/.bin/babel-node
mocha      = ./node_modules/.bin/_mocha

.PHONY: install node_modules clean publish compile npm-publish test;
MAKEFLAGS = -s

default:
	@echo ""
	@echo "Available Targets:"
	@echo ""
	@echo "   make publish (npm)"
	@echo ""

publish: clean compile npm-publish

clean:
	rm -rf lib/*

compile:
	$(babel) src -d lib;

npm-publish:
	npm publish

babel = ./node_modules/.bin/babel

.PHONY: publish clean compile npm-publish;
MAKEFLAGS = -s

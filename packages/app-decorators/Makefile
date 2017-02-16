default:
	@echo ""
	@echo "Available Targets:"
	@echo ""
	@echo "   make test"
	@echo ""

test:
	$(karma) start ../../karma.conf.js --single-run

karma  = ./node_modules/.bin/karma

.PHONY: karma;
MAKEFLAGS = -s

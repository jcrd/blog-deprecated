THEME := themes/readme

serve: node_modules $(THEME)/node_modules
	hugo serve -D

build: node_modules $(THEME)/node_modules
	hugo --minify

node_modules:
	npm ci

$(THEME)/node_modules:
	cd $(THEME) && npm ci

.PHONY: serve build

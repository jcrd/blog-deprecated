THEME := themes/readme
BUILDDIR := builddir

serve: $(THEME)/node_modules
	cd $(THEME) && hugo serve -D -s $(BUILDDIR)

build: $(THEME)/node_modules
	cd $(THEME) && hugo --minify -s $(BUILDDIR)

$(THEME)/node_modules:
	cd $(THEME) && npm ci

.PHONY: serve build

THEME := themes/lessen
BUILDDIR := builddir

serve: $(THEME)/$(BUILDDIR)
	cd $(THEME) && hugo serve -D -s $(BUILDDIR)

build: $(THEME)/$(BUILDDIR)
	cd $(THEME) && hugo --minify -s $(BUILDDIR)

post: $(THEME)/$(BUILDDIR)
	cd $(THEME) && hugo new posts/$(name).md -s $(BUILDDIR)

$(THEME)/$(BUILDDIR):
	./build.sh

.PHONY: serve build post

serve: node_modules
	hugo serve -D

build: node_modules
	hugo --minify

post: node_modules
	hugo new posts/$(name).md

node_modules:
	npm ci

.PHONY: serve build post

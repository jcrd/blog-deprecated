#!/bin/sh

git submodule update --init themes/readme

ln -s themes/readme/node_modules .

cd themes/readme
npm ci
ln -s ../.. builddir
hugo --minify -s builddir

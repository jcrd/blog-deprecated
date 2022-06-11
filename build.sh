#!/bin/sh

ln -s themes/lessen/node_modules .

cd themes/lessen
npm ci
ln -s ../.. builddir
hugo --minify -s builddir

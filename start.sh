#!/bin/sh
browserify html/js/memo.js -o html/js/aggregated.js
node app.js


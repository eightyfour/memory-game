#!/bin/sh
browserify html/js/memo.js -o html/js/aggregated.js
lessc html/css/memory.less html/css/memory.css
node app.js


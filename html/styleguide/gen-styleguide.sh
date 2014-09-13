#!/bin/sh
browserify ../kss-node-template/test.js -o ../kss-node-template/public/test.agg.js
kss-node ../css/less/ ../styleguide -t ../kss-node-template/ -l ../css/less/_main.less

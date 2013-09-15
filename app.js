/**
 * Starts the xxo as a single application
 * @type {*}
 */
var memo = require('./lib/server.js');
var fs = require('fs');
var express = require('express'),
    app = express(),
    server;

app.use(express.static(__dirname + '/html'));


server = app.listen(8000);
console.log('Start server on: 8000');
memo(server);
console.log('Start MEMORY');

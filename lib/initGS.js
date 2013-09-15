var http = require('http');

var dnode = require('dnode');
var shoe = require('shoe');
var client = require('./memoryGS.js')();

/** ----------------------------- Object Definitions ----------------------------- **/

/**
 * TODO
 * @param server
 * @return {*}
 */
var memoryGS = function(server){

    var con;
    var sock = shoe(function (stream) {
        var d = dnode(client);
        d.pipe(stream).pipe(d);
        con = stream;

        con.on('end',function(){
            console.log('CONNECTION ENDS');
        })
    });
    var inst = sock.install(server, '/memory');

};
module.exports = memoryGS;
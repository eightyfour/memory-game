/**
 * Created by han on 31.08.14.
 */

var shoe = require('shoe'),
    dnode = require('dnode'),

    Trade = function (mount) {
        var readyQueue = [],
            server,
            stream = shoe(mount),
            d = dnode();

        d.on('remote', function (connection) {
            server = connection;
            console.log('setup remote');

            // call ready queue - and clear
            readyQueue.forEach(function (cb) {
                cb(server);
            });
            readyQueue = null;

        });
        d.pipe(stream).pipe(d);


        this.ready = function (cb) {
            if (readyQueue !== null) {
                readyQueue.push(cb);
            } else {
                cb(server);
            }
        };

        this.initConnection = function (clientConnection, cb) {
            server.init(clientConnection, cb);
        };
    };

module.exports = Trade;
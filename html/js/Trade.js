/**
 * Created by han on 31.08.14.
 */

var shoe = require('shoe'),
    dnode = require('dnode'),

    Trade = function (mount) {
        var readyQueue = [],
            server,
            stream = shoe(mount),
            d = dnode(),
            that = this;

        this.userPool = {};
        this.gs = {};

        d.on('remote', function (remote) {
            server = remote;
            console.log('setup remote');

            that.gs = server.gs;
            that.userPool = server.up;

            // call ready queue - and clear
            readyQueue.forEach(function (cb) {
                cb();
            });
            readyQueue = null;

        });
        d.pipe(stream).pipe(d);


        this.ready = function (cb) {
            if (readyQueue !== null) {
                readyQueue.push(cb);
            } else {
                cb();
            }
        };

        this.initConnection = function (clientConnection, cb) {
            this.ready(function () {
                server.init(clientConnection, cb);
            });
        };
    }

module.exports = Trade;
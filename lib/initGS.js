var http = require('http');

var dnode = require('dnode');
var shoe = require('shoe');
var memoryGS = require('./memoryGS.js')();
var userPool = require('./userPool.js')();
var C = require('./CONSTANT.js');

/** ----------------------------- Object Definitions ----------------------------- **/

/**
 * deprecated use only user from userPool
 * @param uId
 * @constructor
 */
function User(uId) {
    "use strict";
    this.name = '';
    this.uId = uId;
    this.points = 0; // number of found cards
    this.userGameState = C.GAMESTATE.boardNotready;
}
// holds all client objects
GLOBAL.userClientSessions = {
    broadcast : function (event, sId) {
        var i, args = [].splice.call(arguments, 1);
        for (i = 0; i < this.length; i++) {
            // TODO remove up and gs or do it only for gs
            if (this[this[i]]) {
                this[this[i]][event].apply(null, args);
            }
        }
    },
    // holds reference for userPool
    userPool : userPool,
    length : 0,
    remove : function (sId) {
        var idx;
        if (this.hasOwnProperty(sId)) {
            idx = [].indexOf.call(this, sId);
            console.log('indexOf : ' + idx);
            console.log('DELETEUSER:', [].splice.call(this, idx, 1));
            console.log(this);
            delete this[sId];
        }
    },
    add : function (key, client) {
        if (key !== 'add' && key !== 'length' && key !== 'broadcast' && key !== 'remove') {
            // extend client with broadcast
            client.broadcast = this.broadcast;
            // add as object property
            this[key] = client;
            // add for iteration
            this[this.length++] = key;
        }
    }
};

/**
 * TODO
 * @param server
 * @return {*}
 */
var initGS = function (server) {
    "use strict";

    var con,
        socketId = 0,
        sock = shoe(function (stream) {

            // save the user and close the connection for the specific socket. Each user has it's own socket id
            // and should be saved here... than update userPool and game server that a user with sId leave or
            // enter the lobby.

            // I need a initial message for communication with the client interface. Required to answer the client.
            // If the userPool working as a standalone module with his own client interface e.g.: up (User Pool)
            // than it will be easier to use the userPool for other projects..
            var sId = 'sId_' + socketId++,
                gsListener = function (gs) {

                    var filter = {},
                        call = function (fcName) {
                            return function () {
                                gs[fcName].apply(null, arguments);
                            };
                        },
                        fc;
                    // merge functions
                    for (fc in gs) {
                        if (gs.hasOwnProperty(fc)) {
                            filter[fc] = call(fc);
                        }
                    }
                    filter.registerUser = function (client, user, callback) {

                        console.log('REGISTER USER', user.name);
                        // delegate
                        gs.registerUser.apply(null, arguments);
                    };

                    filter.startNewGame = function (gameConfig, callback) {

                        gs.startNewGame(
                            sId,
                            {user : userPool.getUser(sId), client : userClientSessions[sId]},
                            gameConfig,
                            callback
                        );
                    };

                    filter.joinGame = function (gameId) {

                        gs.joinGame(
                            sId,
                            {user : userPool.getUser(sId), client : userClientSessions[sId]},
                            gameId
                        );
                    };

                    filter.takeCard = function (position) {
                        gs.takeCard(sId, position);
                    };

                    return filter;
                },
                d = dnode({
                    init : function (client, cb) {
                         // initialize the first connection and save the client communication object
                        console.log('SAVE CLIENT OBJECT', client);
                        userClientSessions.add(sId, client);
                        userPool.addUser(sId, new User(sId), client);
                        cb(sId);
                    },
                    gs : gsListener(memoryGS),
                    up : {
                        join : function (name) {
                            var user = userPool.getUser(sId);
                            user.name = name;
                            userPool.joinPool(sId, name);
                            console.log('JOIN', name, sId);
                        }
                    }
                });



            d.pipe(stream).pipe(d);
            con = stream;
            console.log('START CONNECTION');
            d.on('end', function () {
                console.log('END ENDS');
                memoryGS.connectionEnds();
                console.log('GOOD BYE', sId);
                userPool.leavePool(sId);
                userClientSessions.remove(sId);
            });

            d.on('remote', function () {
                console.log('REMOTE VIA CON');
            });

            d.on('local', function () {
                console.log('LOCAL VIA CON');
            });

            d.on('fail', function () {
                console.log('FAIL VIA CON');
            });

            d.on('error', function () {
                console.log('ERROR VIA CON');
            });
        }),
        inst = sock.install(server, '/memory');

};
module.exports = initGS;
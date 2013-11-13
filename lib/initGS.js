var http = require('http');

var dnode = require('dnode');
var shoe = require('shoe');
var memoryGS = require('./memoryGS.js')();
var userPool = require('./userPool.js')();
var C = require('./CONSTANT.js');

/** ----------------------------- Object Definitions ----------------------------- **/

function User(uId) {
    "use strict";
    this.name = '';
    this.uId = uId;
    this.points = 0; // number of found cards
    this.userGameState = C.GAMESTATE.boardNotready;
}

/**
 * TODO
 * @param server
 * @return {*}
 */
var initGS = function (server) {
    "use strict";

    var con,
        userClientSessions = {},
        socketId = 0,
        sock = shoe(function (stream) {

            // save the user and close the connection for the specific socket. Each user has it's own socket id
            // and should be saved here... than update userPool and game server that a user with sId leave or
            // enter the lobby.

            // I need a initial message for communication with the client interface. Required to answer the client.
            // If the userPool working as a standalone module with his own client interface e.g.: up (User Pool)
            // than it will be easier to use the userPool for other projects..
            var sId = socketId++,
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
                            {user : userPool.getUserBySocketId(sId), client : userClientSessions[sId].gs},
                            gameConfig,
                            callback
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
                        userClientSessions[sId] = client;
                        userPool.addUser(sId, new User(sId), client.up);
                        cb(sId);
                    },
                    gs : gsListener(memoryGS),
                    up : {
                        join : function (name) {
                            var user = userPool.getUserBySocketId(sId);
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
                delete userClientSessions[sId];
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
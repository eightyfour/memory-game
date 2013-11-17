
var userPool = function () {
    "use strict";
    var players = {
            map : function (fc) {
                var uId;
                for (uId in this) {
                    if (this.hasOwnProperty(uId) && uId !== 'map') {
                        fc(this[uId]);
                    }
                }
            }
        },
        broadcastAll = (function () {

            return {
                addUser : function (user) {
                    players.map(function (player) {
                        player.client.addUser(user);
                    });
                },
                removeUser : function (user) {
                    players.map(function (player) {
                        player.client.removeUser(user);
                    });
                }
            };
        }()),
        sendUserList = function (client) {
            players.map(function (player) {
                if (player.user.name !== undefined) {
                    client.addUser(player.user);
                } else {
                    console.log('USER_POOL: Found undefined user name: ', player);
                }
            });
        };

    return {
        addUser : function (sId, user, client) {
            players[sId] = {user : user, client : client};
            sendUserList(client);
        },
        joinPool : function (sId, name) {
            if (players.hasOwnProperty(sId)) {
                players[sId].user.name = name;
                userClientSessions.broadcast('addUser', players[sId].user);
            } else {
                console.log('USER_POOL: User with sId: ' + sId + ' not exists! Actual list:', players);
            }

        },
        leavePool : function (sId) {
            if (players.hasOwnProperty(sId)) {
                // TODO change to userClientSessions.broadcast
                broadcastAll.removeUser(players[sId].user);
                delete players[sId];
            } else {
                console.log('USER_POOL: User with sId: ' + sId + ' not exists! Actual list:', players);
            }
        },
        getUserBySocketId : function (sId) {
            return players[sId].user;
        },
        getUserClientBySocketId : function (sId) {
            return players[sId].client;
        }
    };
};

module.exports = userPool;

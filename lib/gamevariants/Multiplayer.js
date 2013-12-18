/*global userClientSessions */
var C = require('../CONSTANT.js'),
    SingleGame = require('./../gametypes/SingleGame.js');
/**
 * game variant for a normal single player game
 */
function Multiplayer(sId, player, cards, util) {
    "use strict";
    console.log('Start Multiplayer game');
    // extend from player.client and only overwrite interesting methods
    var clientListener = {},
        serverListener = {},
        singlePlayerGame,
        // multiPlayerConfig
        mpc = {
            maxUserCount : 2, // can be configured from view
            currentUserCount : 1
        },
        gamePlayer = {
            length : 0,
            broadcast : function (event, args) {
                var i;
                for (i = 0; i < this.length; i++) {
                    this[this[i]].player.client[event].apply(null, args);
                }
            },
            messageNotTurnUsers : function (event, args) {
                var i;
                for (i = 0; i < this.length; i++) {
                    if (!this[this[i]].turn) {
                        this[this[i]].player.client[event].apply(null, args);
                    }
                }
            },
            getCurrentUser : function () {
                var i;
                for (i = 0; i < this.length; i++) {
                    if (this[this[i]].turn) {
                        return this[this[i]];
                    }
                }
            },
            add : function (key, user) {
                if (key !== 'add' && key !== 'length' && key !== 'nextUserTurn' &&
                        key !== 'getCurrentUser' && key !== 'messageNotTurnUsers') {
                    // add as object property
                    this[key] = user;
                    // add for iteration
                    this[this.length++] = key;
                }
            },
            nextUserTurn : function () {
                var user, i;
                // just toggle - more players can be handled via index map
                for (i = 0; i < this.length; i++) {
                    user = this[this[i]];
                    if (user.turn === true) {
                        user.turn = false;
                        if (i + 1 < this.length) {
                            this[this[i + 1]].turn = true;
                        } else {
                            this[this[0]].turn = true;
                        }
                        break;
                    }
                }

            }
        },
        createSingleGame = function (player, gameConfig, util) {
            var cardSet, newCards, game;
            if (gameConfig.numberOfSymbols && (util.deck.length > gameConfig.numberOfSymbols)) {
                cardSet = util.shuffle(util.deck).slice(0, parseInt(gameConfig.numberOfSymbols, 10));
            } else {
                cardSet = util.deck;
            }
            newCards = util.createCardObjects(util.shuffle(cardSet.concat(cardSet)));
            game = new SingleGame(clientListener, newCards);
            return {game : game, newCards : newCards};
        },
        wrapFunctionWithListener = function (obj, listener) {
            var fc, closureFc = function (fcName) {
                listener[fcName] = function () {
                    obj[fcName].apply(null, arguments);
                };
            };
            for (fc in obj) {
                if (obj.hasOwnProperty(fc)) {
                    if (typeof obj[fc] === 'function') {
                        closureFc(fc);
                    } else {
                        listener[fc] = obj[fc];
                    }
                }
            }
            return listener;
        },
        fc = {
            showOpenGame :  function () {
                userClientSessions.broadcast('gameOverview', 'showOpenGame', {
                    gameId : serverListener.gameConf.gameId,
                    creator : player.user,
                    gameType : 'TODO'
                });
            },
            removeOpenGame : function () {
                userClientSessions.broadcast('gameOverview', 'removeOpenGame', {
                    gameId : serverListener.gameConf.gameId
                });
            },
            startGame : function () {
                var users = {}, i;
                for (i = 0; i < gamePlayer.length; i++) {
                    users[gamePlayer[i]] = {turn : gamePlayer[gamePlayer[i]].turn};
                }
                userClientSessions.broadcast('gameOverview', 'startGame', {
                    gameId : serverListener.gameConf.gameId,
                    users : users
                });
                gamePlayer.getCurrentUser().player.client.gameOverview('setTurn', true);
                gamePlayer.messageNotTurnUsers('gameOverview', ['setTurn', false]);
            }
        };

    function muliplayerUser(player) {
        var ret = {
            player : player,
            turn : false,
            stats : {
                matches : 0,
                gameState: -1
            }
        };
        return ret;
    }

    function calculateWinner() {
        var i, j, gameState, users = [], userWon = gamePlayer[0];

        // made a array for better comparision
        for (i = 0; i < gamePlayer.length; i++) {
            users.push({sId : gamePlayer[i], matches : gamePlayer[gamePlayer[i]].stats.matches});
        }

        users.sort(function (a, b) {
            var ret = 0;
            if (a.matches < b.matches) {
                ret = 1;
            } else if (a.matches > b.matches) {
                ret = -1;
            }
            return ret;
        });

        // setup winner
        // TOOD test if this working correctly
        (function () {
            var restLost = false, user, nextUserIdx, i;

            for (i = 0; i < users.length; i++) {
                user = users[i];
                nextUserIdx = i + 1;
                if (!restLost && users[nextUserIdx] !== undefined && user.matches > users[nextUserIdx].matches) {
                    gamePlayer[user.sId].stats.gameState = C.GAMESTATE.won;
                    restLost = true;
                } else if (!restLost && users[nextUserIdx] !== undefined && user.matches === users[nextUserIdx].matches) {
                    gamePlayer[user.sId].stats.gameState = C.GAMESTATE.draw;
                    gamePlayer[users[nextUserIdx].sId].stats.gameState = C.GAMESTATE.draw;
                } else {
                    restLost = true;
                    if (gamePlayer[user.sId].stats.gameState !== C.GAMESTATE.draw) {
                        gamePlayer[user.sId].stats.gameState = C.GAMESTATE.lost;
                    }
                }
            }
        }());

        console.log('gameState=', users);

    }

    // wrap with listener:
    clientListener = wrapFunctionWithListener(player.client, clientListener);
    // implement interesting methods
    clientListener.gameEnds = function (gameConf, gameState, gameStats) {

        calculateWinner();

        // send game end for all player separate
        var i;
        for (i = 0; i < gamePlayer.length; i++) {
            // TODO check this
            gamePlayer[gamePlayer[i]].player.client.gameEnds(gameConf, gamePlayer[gamePlayer[i]].stats.gameState, gameStats);
        }

        gamePlayer.broadcast('gameEnds', [].slice.call(arguments));



//        switch (gameState) {
//        case C.GAMESTATE.won:
//        case C.GAMESTATE.lost:
//        case C.GAMESTATE.draw:
//        default:
        console.log('GAME STATE IS: ' + gameState);
//        }

        player.client.showToast('-- Matches: ' + gameStats.matches + ' --');
        player.client.showToast('-- Failed: ' + gameStats.failed + ' --');
        player.client.showToast('-- Tries: ' + gameStats.tries + ' --');
        player.client.showToast('- Statistics: -');
    };
    clientListener.showCard = function () {
        gamePlayer.broadcast('showCard', [].slice.call(arguments));
    };
    clientListener.hideCards = function () {
        gamePlayer.broadcast('hideCards', [].slice.call(arguments));
        gamePlayer.nextUserTurn();
        // send a specific message via gameOverview
        gamePlayer.getCurrentUser().player.client.gameOverview('setTurn', true);
        // send a specific message via gameOverview
        gamePlayer.messageNotTurnUsers('gameOverview', ['setTurn', false]);
    };
    clientListener.showMatchedCard = function () {
        // TODO count matches for current user
        gamePlayer.getCurrentUser().stats.matches++;
        gamePlayer.broadcast('showMatchedCard', [].slice.call(arguments));
    };
    // create single game
    singlePlayerGame = createSingleGame(clientListener, cards, util);
    // wrap function with listener
    serverListener = wrapFunctionWithListener(singlePlayerGame.game, serverListener);

    serverListener.takeCard = function (sId, cardPosition, doneCb) {
        // block all take card if
        // * only one user played this game
        // * only if it the turn of the user
        if (gamePlayer[sId].turn) {
            console.log('Normal serverListener: takeCard', cardPosition);
            singlePlayerGame.game.takeCard.apply(
                singlePlayerGame.game,
                [].slice.call(arguments)
            );
        } else {
            console.log("It's not your turn");
            gamePlayer[sId].player.client.showToast("It's not your turn");
            doneCb();
        }
    };

    //
    gamePlayer.add(sId, muliplayerUser(player));
    // creator will start game
    gamePlayer[sId].turn = true;

    // send new table to all clients

    fc.showOpenGame();
//
//    // extend game with multiplayer required methods
    serverListener.addPlayer = function (userId, player) {

        mpc.currentUserCount++;

        if (mpc.currentUserCount <= mpc.maxUserCount) {

            console.log('Add player ' + player.user.name + ' with sId: ' + userId);
            console.log('Add player ' + userId);
            gamePlayer.add(userId, muliplayerUser(player));
            userClientSessions[userId].generateBoard(serverListener.gameConf, singlePlayerGame.newCards.length);

            // if maximum of players -> game can start
            if (mpc.currentUserCount === mpc.maxUserCount) {
                fc.removeOpenGame();
                fc.startGame();
            }
        }
    };

    return {
        game : serverListener,
        newCards : singlePlayerGame.newCards
    };
}
module.exports = Multiplayer;
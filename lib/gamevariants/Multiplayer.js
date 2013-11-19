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
        gamePlayer = {
            length : 0,
            broadcast : function (event, args) {
                var i;
                for (i = 0; i < this.length; i++) {
                    this[this[i]].player.client[event].apply(null, args);
                }
            },
            add : function (key, user) {
                if (key !== 'add' && key !== 'length' && key !== 'nextUserTurn') {
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
        };
    // wrap with listener:
    clientListener = wrapFunctionWithListener(player.client, clientListener);
    // implement interesting methods
    clientListener.gameEnds = function (gameConf, gameState, gameStats) {
        player.client.gameEnds.call([].slice.call(arguments));

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
    };
    clientListener.showMatchedCard = function () {
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
    gamePlayer.add(sId, {
        player : player,
        turn : true
    });

    userClientSessions.broadcast('gameOverview', 'showOpenGame', {
        gameId : serverListener.gameConf.gameId,
        creator : player.user,
        gameType : 'TODO'
    });
//
//    // extend game with multiplayer required methods
    serverListener.addPlayer = function (userId, player) {
        console.log('Add player ' + player.user.name + ' with sId: ' + userId);
        console.log('Add player ' + userId);
        gamePlayer.add(userId, {
            player : player,
            turn : false
        });
        userClientSessions[userId].generateBoard(serverListener.gameConf, singlePlayerGame.newCards.length);
        // if maximum of players -> game can start
    };

    return {
        game : serverListener,
        newCards : singlePlayerGame.newCards
    };
}
module.exports = Multiplayer;


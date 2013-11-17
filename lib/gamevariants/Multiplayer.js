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
        gamePlayer = {},
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
    // create single game
    singlePlayerGame = createSingleGame(clientListener, cards, util);
    // wrap function with listener
    serverListener = wrapFunctionWithListener(singlePlayerGame.game, serverListener);

    serverListener.takeCard = function (sId, cardPosition, doneCb) {
        // block all take card if
        // * only one user played this game
        // * only if it the turn of the user
        if (false) {
            console.log('Normal serverListener: takeCard', cardPosition);
            singlePlayerGame.game.takeCard.apply(
                singlePlayerGame.game,
                [].slice.call(arguments)
            );
        } else {
            console.log("It's not your turn");
        }

    };

    //
    gamePlayer[sId] = {
        player : player,
        turn : true
    };

    userClientSessions.broadcast('gameOverview', 'showOpenGame', {
        gameId : serverListener.gameConf.gameId,
        creator : player.user.name,
        gameType : 'TODO',
        join : function (userId) {
            console.log('Add player ' + userId);
            gamePlayer[sId].player = userId;
        }
    });
//
//    // extend game with multiplayer required methods
//    serverListener.addPlayer = function (sId, player) {
//        console.log('Add player ' + player.user.name + ' with sId: ' + sId);
//        gamePlayer[sId].player = player;
//        // if maximum of players -> game can start
//    };

    return {
        game : serverListener,
        newCards : singlePlayerGame.newCards
    };
}
module.exports = Multiplayer;


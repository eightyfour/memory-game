var C = require('../CONSTANT.js'),
    SingleGame = require('./../gametypes/SingleGame.js');
/**
 * game variant for a normal single player game
 */
function MoreAndMore(player, cards, util) {
    "use strict";
    console.log('Start MoreAndMore game');
    var gameStatus = {
            round : 0, //initial
            doubleSelected : 0
        },
        gameRules = {
            maxDoubleSelected : 3
        },
        // extend from player.client and only overwrite interesting methods
        clientListener = {},
        serverListener = {},
        singlePlayerGame,
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
//            case C.GAMESTATE.won:
//            case C.GAMESTATE.lost:
//            case C.GAMESTATE.draw:
//            default:
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

    serverListener.takeCard = function (cardPosition, doneCb) {
        console.log('Normal serverListener: takeCard', cardPosition);
        singlePlayerGame.game.takeCard.apply(
            singlePlayerGame.game,
            [].slice.call(arguments)
        );
    };

    return {
        game : serverListener,
        newCards : singlePlayerGame.newCards
    };
}
module.exports = MoreAndMore;


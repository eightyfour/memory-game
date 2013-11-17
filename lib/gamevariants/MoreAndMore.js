var C = require('../CONSTANT.js'),
    SingleGame = require('./../gametypes/SingleGame.js');
/**
 * game variant for a normal single player game
 */
function MoreAndMore(player, cards, util) {
    "use strict";
    console.log('Start MoreAndMore game');
    var gameStatus = {
            round : 1, //initial
            matches : 0,
            doubleSelected : 0,
            cards : {}, // object with position and number of selected
            saveLastCard : null,
            saveDoubleSelectedCard : null,
            gameOver : false
        },
        gameRules = {
            maxDoubleSelected : 3,
            maxRoundsToPlay : 99
        },
        currendCards = {},  // the actual cards map (modified by SingleGame)
        // extend from player.client and only overwrite interesting methods
        clientListener = {},
        serverListener = {},
        singlePlayerGame,
        createSingleGame = function (player, gameConfig, util) {
            var cardSet, game;

            cardSet = util.shuffle(util.deck).slice(0, gameStatus.round + 1);

            currendCards = util.createCardObjects(util.shuffle(cardSet.concat(cardSet)));
            game = new SingleGame(clientListener, currendCards);
            return {game : game, newCards : currendCards};
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
        gameStatus.round++; // next round
        if (gameRules.maxRoundsToPlay > gameStatus.round) {
            // clear board on client
            player.client.clearBoard();
            // create new single game
            singlePlayerGame = createSingleGame(clientListener, cards, util);
            // reset gamecards
            gameStatus.cards = {};
            // initalize the board on client
            player.client.generateBoard(singlePlayerGame.game.gameConf, singlePlayerGame.newCards.length);
        } else {
            player.client.gameEnds.call([].slice.call(arguments));
            player.client.printDebug('-- Matches: ' + gameStats.matches + ' --');
            player.client.showToast('-- Failed: ' + gameStats.failed + ' --');
            player.client.showToast('-- Tries: ' + gameStats.tries + ' --');
            player.client.showToast('- Statistics: -');
        }
        console.log('GAME STATE IS: ' + gameState);
    };
    clientListener.showMatchedCard = function (gameConf, actualCard, card) {
        gameStatus.matches++;
        player.client.updateGameStats({matches : gameStatus.matches});
        player.client.showMatchedCard.apply(null, [].slice.call(arguments));
    };
    // create single game
    singlePlayerGame = createSingleGame(clientListener, cards, util);
    // wrap function with listener
    serverListener = wrapFunctionWithListener(singlePlayerGame.game, serverListener);
    serverListener.takeCard = function (sId, cardPosition, doneCb) {

        if (gameStatus.gameOver) {
            doneCb();// ignore all take card events
            player.client.showToast('Game Over - Please start a new game');
            return;
        }

        if (currendCards[cardPosition].state === C.CARD_STATE.hidden) {

            // it could also be that you made a double double-click in one match

            // have I double selected card in cache? Than check the types
            if (gameStatus.saveDoubleSelectedCard !== null) {
                if (gameStatus.saveDoubleSelectedCard.type !== currendCards[cardPosition].type) {
                    gameStatus.doubleSelected++;
                    player.client.updateGameStats({doubleSelected : gameStatus.doubleSelected});
                }
                gameStatus.saveDoubleSelectedCard = null;
            }

            // detect a allready clicked card
            if (currendCards[cardPosition].clicked >= 1) {
                // check is this the second card
                if (gameStatus.saveLastCard && gameStatus.saveLastCard.state === C.CARD_STATE.open) {
                    if (gameStatus.saveLastCard.type !== currendCards[cardPosition].type) {
                        gameStatus.doubleSelected++;
                        player.client.updateGameStats({doubleSelected : gameStatus.doubleSelected});
                    }
                } else {
                    // nope, it's the first card than cache the actual
                    gameStatus.saveDoubleSelectedCard = currendCards[cardPosition];
                }

                player.client.printDebug('Number of double selected: ' + gameStatus.doubleSelected);
            }
            // save as last card for next move
            gameStatus.saveLastCard = currendCards[cardPosition];
        }

        if (gameStatus.doubleSelected >= gameRules.maxDoubleSelected) {
            player.client.showToast('Game Over');
            gameStatus.gameOver = true;
        }

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


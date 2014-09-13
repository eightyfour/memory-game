
var toast = require('message-toast'),
    receiver = function (lobby, rink, rinkStats, userPool) {

        return {
            addUser: function (user) {
                userPool.addNewUser(user);
            },
            removeUser: function (user) {
                userPool.removeUser(user);
            },
            showToast: function () {
                //  console.log.apply(console,[].slice.call(arguments));
                toast.showMessage.apply(null, [].slice.call(arguments));
            },
            printDebug: function () {
                console.log.apply(console, [].slice.call(arguments));
                //  toast.showMessage.apply(null,[].slice.call(arguments));
            },
            updateGameStats: function (gameStats) {
                if (gameStats.hasOwnProperty('doubleSelected')) {
                    rinkStats.doubleSelected(gameStats.doubleSelected);
                }
                if (gameStats.hasOwnProperty('matches')) {
                    rinkStats.matches(gameStats.matches);
                }
            },
            gameEnds: function (gameConf, gameState, gameStats) {
                console.log('GAME STATE IS: ' + gameState);
            },
            /**
             * handle lobby events - TODO rename gameOverview
             */
            gameOverview: function (key, value) {
                console.log('gameOverview', key, value);
                lobby[key](value);
            },
            showMatchedCard: function (gameConf, firstCard, secondCard) {
                rink.cards.match(gameConf, firstCard, secondCard);
            },
            showCard: function (gameConf, card) {
                rink.cards.show(gameConf, card);
            },
            // TODO implement all show all cards
            showAllCards: function (gameConf, cards) {
                (function show(i) {
                    if (i < cards.length) {
                        setTimeout(function () {
                            rink.cards.show(gameConf, cards[i]);
                            show(i + 1);
                        }, 300);
                    }
                }(0));
            },
            hideCards: function (gameConf, cards) {
                rink.cards.hide(gameConf, cards);
            },
            removeCard: function (gameConf, card) {
                rink.cards.remove(gameConf, card);
            },
            clearBoard: function () {
                rink.board.clear();
            },
            generateBoard: function (gameConf, numberOfcards) {
                rink.board.generateNew(gameConf, numberOfcards);
            }
        }
    }

module.exports = receiver;
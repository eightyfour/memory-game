
var toast = require('message-toast'),
    receiver = function (lobby, ui, rinkStats, userPool) {

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
                ui.cards.match(gameConf, firstCard, secondCard);
            },
            showCard: function (gameConf, card) {
                ui.cards.show(gameConf, card);
            },
            hideCards: function (gameConf, cards) {
                ui.cards.hide(gameConf, cards);
            },
            removeCard: function (gameConf, card) {
                ui.cards.remove(gameConf, card);
            },
            clearBoard: function () {
                ui.board.clear();
            },
            generateBoard: function (gameConf, numberOfcards) {
                ui.board.generateNew(gameConf, numberOfcards);
            }
        }
    }

module.exports = receiver;
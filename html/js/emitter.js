
var emitter = function (ui, userPool, toast) {

    return {
        addUser : function (user) {
            userPool.addNewUser(user);
        },
        removeUser : function (user) {
            userPool.removeUser(user);
        },
        showToast : function () {
            //  console.log.apply(console,[].slice.call(arguments));
            toast.showMessage.apply(null, [].slice.call(arguments));
        },
        printDebug : function () {
            console.log.apply(console, [].slice.call(arguments));
            //  toast.showMessage.apply(null,[].slice.call(arguments));
        },
        updateGameStats : function (gameStats) {
            if (gameStats.hasOwnProperty('doubleSelected')) {
                ui.updateGameStats.doubleSelected(gameStats.doubleSelected);
            }
            if (gameStats.hasOwnProperty('matches')) {
                ui.updateGameStats.matches(gameStats.matches);
            }
        },
        gameEnds : function (gameConf, gameState, gameStats) {
            console.log('GAME STATE IS: ' + gameState);
        },
        /**
         * handle list of current games
         */
        gameOverview : function (key, value) {
            console.log('gameOverview', key, value);
            ui[key](value);
        },
        showMatchedCard : function (gameConf, firstCard, secondCard) {
            ui.cards.match(gameConf, firstCard, secondCard);
        },
        showCard : function (gameConf, card) {
            ui.cards.show(gameConf, card);
        },
        hideCards : function (gameConf, cards) {
            ui.cards.hide(gameConf, cards);
        },
        removeCard : function (gameConf, card) {
            ui.cards.remove(gameConf, card);
        },
        clearBoard : function () {
            ui.board.clear();
        },
        generateBoard : function (gameConf, numberOfcards) {
            ui.board.generateNew(gameConf, numberOfcards);
        }
    }
}

module.exports = emitter;
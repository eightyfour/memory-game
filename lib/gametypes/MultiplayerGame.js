var C = require('../CONSTANT.js');
/**
 * game logic for a single player game
 */
function SingleGame(client,cards){

    var actualCard=null;
    var cardDelay = 2e3;
    var conditions = {
        maxMatches : cards.length/2
    }
    var gameStats = {
        matches : 0,
        failed : 0,
        tries : 0
    }
    // all methods send to client stars with the gameConf object
    var gameConf = {
        gameId : (new Date()).getTime()
    };
    this.gameConf = gameConf;

    this.takeCard = function(cardPosition,doneCb){
        var card = cards[cardPosition];
        if(card.state !== C.CARD_STATE.empty &&
            !(actualCard !== null && actualCard.position === card.position)){
            card.state = C.CARD_STATE.open;
            gameStats.tries++;
            card.clicked++;
            if(actualCard !== null){
                if(actualCard.type === card.type){
                    gameStats.matches++;
                    client.showToast('MATCHES ARE: '+gameStats.matches+' Required matches: '+conditions.maxMatches );
                    client.showToast('Match: '+card.type);
                    client.showMatchedCard(gameConf,actualCard,card);

                    if(gameStats.matches === conditions.maxMatches){
                        client.showToast("You've finished the game!");
                        client.gameEnds(gameConf,C.GAMESTATE.won,gameStats);
                    }

                    cards[actualCard.position].state = C.CARD_STATE.empty;
                    cards[card.position].state = C.CARD_STATE.empty;
                    actualCard = null;

                    doneCb && doneCb();

                } else {
                    client.showCard(gameConf,card);
                    cards[actualCard.position].state = C.CARD_STATE.hidden;
                    cards[card.position].state = C.CARD_STATE.hidden;

                    client.hideCard(gameConf,actualCard);
                    client.hideCard(gameConf,card);
                    actualCard = null;
                    doneCb && doneCb();

                    gameStats.failed++;
                }
            } else {
                actualCard = card;
                client.showCard(gameConf,card);
                doneCb && doneCb();
            }
        } else {
            console.log('Card with state empty or same card was clicked');
            doneCb && doneCb();
        }
    }
}
module.exports = SingleGame;
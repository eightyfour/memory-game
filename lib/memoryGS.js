
var C = require('./CONSTANT.js'),
    SingleGame = require('./gametypes/SingleGame.js'),
    Normal = require('./gamevariants/Normal.js'),
    MoreAndMore = require('./gamevariants/MoreAndMore.js');

/** +++++++++++++++++++++++++++++ Constants +++++++++++++++++++++++++++++ **/


/** ----------------------------- Constants ----------------------------- **/
/** +++++++++++++++++++++++++++++ Object Definitions +++++++++++++++++++++++++++++ **/

var BLOCK = (function(){
    var block = false;

    return {
        free  : function(){
            block = false;
        },
        filter : function(fc){
            var args;
            if(block === false){
                block = true; // block all function - free must called after each filtered method
                args = [].splice.call(arguments,1);
                fc.apply(null,args);
            } else {
                // put in queue?
                console.log('BLOCK REQUEST');
            }
        }
    }
})();

function User(name){
    this.name = name;
//    this.boardId = id;
    this.points = 0; // number of found cards
    this.userGameState = C.GAMESTATE.boardNotready;
}

function Card(type,position){
    this.type = type;
    this.position = position;
    this.state = C.CARD_STATE.hidden;
    this.clicked = 0;
    this.gameId = 0; // set up in game creation
}

var COLOR_CARDS = ['red','blue','green','yellow','purple','black','cyan','slategray'];

var ANIMAL_CARDS = [
    'bull','deer','donkey','elephant_1','elephant_2','fish_1','fish_2','fish_3','fish_4','gnu',
    'goat','hippo','kangaroo','monkey','ostrich','pig','pinguin','ray','rhino_1','rhino_2','shark_1','shark_2'
];

var util = {
    createCardObjects : function (cards){
        var i = 0, cardObjs = cards.map(function(card){
            return new Card(card,i++);
        });
        return cardObjs;
    },
    shuffle : function (array) {
        var counter = array.length, temp, index;

        // While there are elements in the array
        while (counter--) {
            // Pick a random index
            index = (Math.random() * (counter + 1)) | 0;
            // And swap the last element with it
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    }
}

var userIdCounter = 0;

var memoryGS = function(){

    var players = [];
    /**
     * The client methods are only for better coding - the implementation is on the client side
     * @type {{showCard: Function, hideCard: Function, removeCard: Function, clearBoard: Function, generateBoard: Function}}
     */
    var client = {
        showCard : function(card){
            /* implement on client side */
        },
        hideCard : function(card){
            /* implement on client side */
        },
        removeCard : function(card){
            /* implement on client side */
        },
        clearBoard : function(){
            /* implement on client side */
        },
        generateBoard : function(cards){
            /* implement on client side */
        }
    }

    return {
        registerUser : function (client,user,callback) {
            userIdCounter++;
            client.showToast('Hello '+user.name);
            players[userIdCounter] = {user : new User(user.name), client : client};
            callback(userIdCounter);
        },
        /**
         * gameConfig {
         *     gametype : ;
         *     numberOfSymbols : ;
         * }
         * @type {*}
         */
        startNewGame : function (userId, gameConfig, callback) {
            var gametype = gameConfig.gametype;
            BLOCK.filter(function(blockFree){
                var conf,player = players[userId];

                player.client.clearBoard();
                switch(gametype){
                    case C.GAME_TYPES.SINGLE:
                    default :
                        (function(){
                            // configure deck
                            util.deck = ANIMAL_CARDS.slice();
                            conf = new Normal(player,gameConfig,util);
                        }());
                }
                player.game = conf.game;
                callback(conf.game.gameConf);
                blockFree();
                player.client.generateBoard(conf.game.gameConf,conf.newCards.length);
            },BLOCK.free);
        },
        takeCard : function(userId,position){ 
            BLOCK.filter(function(fc){
                players[userId].game.takeCard(position,fc);
            },BLOCK.free);
        }
    }
}

module.exports = memoryGS;
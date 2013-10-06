
var C = require('./CONSTANT.js'),
    SingleGame = require('./gametypes/SingleGame.js'),
    Normal = require('./gamevariants/Normal.js'),
    MoreAndMore = require('./gamevariants/MoreAndMore.js');

/** +++++++++++++++++++++++++++++ Constants +++++++++++++++++++++++++++++ **/

function User(name) {
    "use strict";
    this.name = name;
//    this.boardId = id;
    this.points = 0; // number of found cards
    this.userGameState = C.GAMESTATE.boardNotready;
}

function Card(type, position) {
    "use strict";
    this.type = type;
    this.position = position;
    this.state = C.CARD_STATE.hidden;
    this.clicked = 0;
    this.gameId = 0; // set up in game creation
}

/** ----------------------------- Constants ----------------------------- **/
/** +++++++++++++++++++++++++++++ Object Definitions +++++++++++++++++++++++++++++ **/

var BLOCK = (function () {
        "use strict";
        var block = false;

        return {
            free  : function () {
                block = false;
            },
            filter : function (fc) {
                var args;
                if (block === false) {
                    block = true; // block all function - free must called after each filtered method
                    args = [].splice.call(arguments, 1);
                    fc.apply(null, args);
                } else {
                    // put in queue?
                    console.log('BLOCK REQUEST');
                }
            }
        };
    }()),

    COLOR_CARDS = ['red', 'blue', 'green', 'yellow', 'purple', 'black', 'cyan', 'slategray'],

    ANIMAL_CARDS = [
        'bull', 'deer', 'donkey', 'elephant_1', 'elephant_2', 'fish_1', 'fish_2', 'fish_3', 'fish_4', ' gnu',
        'goat', 'hippo', 'kangaroo', 'monkey', 'ostrich', 'pig', 'pinguin', 'ray', 'rhino_1', 'rhino_2', 'shark_1', 'shark_2'
    ],

    util = {
        createCardObjects : function (cards) {
            "use strict";
            var i = 0, cardObjs = cards.map(function (card) {
                return new Card(card, i++);
            });
            return cardObjs;
        },
        shuffle : function (array) {
            "use strict";
            var counter = array.length, temp, index;

            // While there are elements in the array
            while (counter--) {
                // Pick a random index
                index = parseInt((Math.random() * (counter + 1)), 10);
                // And swap the last element with it
                temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }
            return array;
        }
    },
    userIdCounter = 0,

    memoryGS = function () {
        "use strict";
        var players = [],
        /**
         * The client methods are only for better coding - the implementation is on the client side
         * @type {{showCard: Function, hideCard: Function, removeCard: Function, clearBoard: Function, generateBoard: Function}}
         */
            client = {
                showCard : function (card) {
                    /* implement on client side */
                },
                hideCard : function (card) {
                    /* implement on client side */
                },
                removeCard : function (card) {
                    /* implement on client side */
                },
                clearBoard : function () {
                    /* implement on client side */
                },
                generateBoard : function (cards) {
                    /* implement on client side */
                }
            };

        return {
            registerUser : function (client, user, callback) {
                userIdCounter++;
                client.showToast('Hello ' + user.name);
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
                var gameVariant = gameConfig.gameVariant;
                BLOCK.filter(function (blockFree) {
                    var conf, player = players[userId];

                    player.client.clearBoard();
                    // configure deck
                    util.deck = ANIMAL_CARDS.slice();

                    switch (parseInt(gameVariant, 10)) {
                    case C.GAME_VARIANTS.moreAndMore:
                        conf = new MoreAndMore(player, gameConfig, util);
                        break;
                    case C.GAME_VARIANTS.normal:
                        conf = new Normal(player, gameConfig, util);
                        break;
                    default:
                        conf = new Normal(player, gameConfig, util);
                    }
                    player.game = conf.game;
                    callback(conf.game.gameConf);
                    blockFree();
                    player.client.generateBoard(conf.game.gameConf, conf.newCards.length);
                }, BLOCK.free);
            },
            takeCard : function (userId, position) {
                BLOCK.filter(function (fc) {
                    players[userId].game.takeCard(position, fc);
                }, BLOCK.free);
            }
        };
    };

module.exports = memoryGS;
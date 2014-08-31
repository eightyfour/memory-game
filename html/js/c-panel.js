/**
 * Created by han on 31.08.14.
 */

var C = require('../../lib/CONSTANT.js'),
    panel = function () {

        var events = {
            createGame : function () {}
        },
        createNewGame = function () {
            var numberOfSymbols = document.getElementById('numberOfSymbols').value,
                gameVariant = document.getElementById('gameVariant').value;

            events.createGame({
                gametype : C.GAME_TYPES.SINGLE,
                numberOfSymbols : numberOfSymbols,
                gameVariant : gameVariant
            });
        },
        brain = {
            createNewGame : function (node) {
                node.addEventListener('click', function () {
                    createNewGame();
                })
            }
        };

        return {
            add : function (node, attr) {
                if (brain.hasOwnProperty(attr)) {
                    brain[attr](node);
                }
            },
            createNewGame : createNewGame,
            onCreateGame : function (fc) {
                events.createGame = fc;
            }
        }
    };
module.exports = panel;
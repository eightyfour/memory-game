
var toast = require('message-toast'),
    reset = require('./reset'),
    emitter = (function () {
        var gs, up;
        return {
            setup : function (trade) {
                gs = trade.gs;
                up = trade.up;
            },
            gs : {
                startNewGame : function (gameConfig, cb) {
                    reset.trigger.resetRink();
                    gs.startNewGame(gameConfig, cb);
                },
                joinGame : function (creatorId) {
                    reset.trigger.resetRink();
                    gs.joinGame(creatorId);
                },
                takeCard : function (position) {
                    gs.takeCard(position);
                }
            },
            up : {
                join : function (userName) {
                    up.join(userName);
                }
            }
        }
    }());

module.exports = emitter;
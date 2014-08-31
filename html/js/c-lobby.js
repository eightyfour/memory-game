/**
 * Created by han on 31.08.14.
 */


var user = require('./user'),
    toast = require('message-toast'),
    lobby = function () {

    var rootNode,
        events = {
            joinGame : function () {}
        };

    return {
        events : {
            onJoinGame : function (fc) {
                events.joinGame = fc;
            }
        },
        add : function (node, attr) {
            // todo
        },
        emitter : {
            showOpenGame : function (value) {
                var root = document.getElementById('actualGames'),
                    li = domOpts.createElement('li', 'openGame_' + value.gameId);
                li.addEventListener('click', function Select(e) {
                    console.log('Try join game: ' + value.creator.uId);
                    events.joinGame(value.creator.uId);
                }, false);
                li.innerText = value.gameId;
                li.domAppendTo(root);
            },
            removeOpenGame : function (value) {
                document.getElementById('openGame_' + value.gameId).domRemove();
            },
            startGame : function (obj) {
                if (obj.users[user.getUId()].turn) {
                    toast.showMessage('You can start the game');
                }
            },
            setTurn : function (bool) {
                var msg, state;
                if (bool) {
                    msg = "It's your turn";
                    state = canny.rinkMessages.C.OWN_TURN;
                } else {
                    msg = "...wait for opponent";
                    state = canny.rinkMessages.C.OPPONENT_TURN;
                }
                canny.rinkMessages.show(msg, state);
            }
        }
    }
};
module.exports = lobby;
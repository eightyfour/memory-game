/*global */
/*jslint browser: true */
/**
 *
 * @type {*}
 */
var domOpts = require('dom-opts'),
    canny = require('canny'),
    toast = require('message-toast'),
    C = require('../../lib/CONSTANT.js'),
    Trade = require('./Trade'),
    trade = new Trade('/memory'),
    emitter = require('./emitter'),
    user = require('./user');

canny.add('userPool', require('./c-userPool')());
canny.add('layout', require('./c-layout')());
canny.add('lobby', require('./c-lobby')());
canny.add('panel', require('./c-panel')());
canny.add('rinkMessages', require('./c-rinkMessages')());
canny.add('rinkStats', require('./c-rinkStats')());
canny.add('rink', require('./c-rink')());


// publish required modules to global
window.canny = canny;
window.domOpts = domOpts;
window.userPool = {};
// create game namespace
window.game = window.game || {};

canny.ready(function () {
    "use strict";

    trade.ready(function () {

        // pass the client connections to the server and get a user session ID back
        trade.initConnection(emitter(
                canny.lobby.emitter,
                canny.rink.emitter, canny.rinkStats.emitter,
                canny.userPool.emitter),
            function (sId) {
                user.setUId(sId);
        });

        // register click handler when card is clicked
        canny.rink.onCardClick(function (position) {
            trade.gs.takeCard(position);
        });

        canny.panel.onCreateGame(function (gameConfig) {
            trade.gs.startNewGame(gameConfig, function (gameId) {
                // TODO - why I need the game ID ?
                window.game.memo.currentGameId = gameId;
            });
        });

        canny.lobby.events.onJoinGame(function (creatorId) {
            trade.gs.joinGame(creatorId);
        });

        // register user
        user.setName(window.prompt('Enter your name please'));

        trade.userPool.join(user.getName());

        // start a new game
        trade.gs.startNewGame({
            gametype : C.GAME_TYPES.SINGLE,
            gameVariant : C.GAME_VARIANTS.moreAndMore,
            numberOfSymbols : 30
        }, function (gameId) {
            window.game.memo.currentGameId = gameId;
            console.log(window.game);
        });
    });
});
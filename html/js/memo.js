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
    receiver = require('./receiver'),
    reset = require('./reset'),
    user = require('./user');

canny.add('whisker', require('canny/mod/whisker'));
canny.add('userPool', require('./c-userPool')());
canny.add('userPanel', require('./c-userPanel')());
canny.add('layout', require('./c-layout')());
canny.add('lobby', require('./c-lobby')());
canny.add('panel', require('./c-panel')());
canny.add('rinkMessages', require('./c-rinkMessages')());
canny.add('rinkStats', require('./c-rinkStats')());
canny.add('rink', require('./c-rink')());


// register all modules which need to reset in a specific case
reset.register.resetRink(canny.rinkStats, canny.rink);

// publish required modules to global
window.canny = canny;
window.domOpts = domOpts;
window.userPool = {};
// create game namespace
window.game = window.game || {};

// wait that all modules are parsed
canny.ready(function () {
    "use strict";

    // wait that connection is ready to use
    trade.ready(function (con) {

        // setup emitter with connection obj
        emitter.setup(con);

        // pass the client connections to the server and as present you will get a user session ID back
        trade.initConnection(receiver(
                canny.lobby.emitter,
                canny.rink.emitter, canny.rinkStats.emitter,
                canny.userPool.emitter),
            function (sId) {
                user.setUId(sId);
        });

        // the following lines could be refactored - the emitter is a global
        // single instance and each module could call it by own

        // register click handlers:
        canny.rink.onCardClick(function (position) {
            emitter.gs.takeCard(position);
        });

        canny.panel.onCreateGame(function (gameConfig) {
            emitter.gs.startNewGame(gameConfig, function (gameId) {
                // TODO - why I need the game ID ?
                console.log(gameId);
            });
        });

        canny.lobby.events.onJoinGame(function (creatorId) {
            emitter.gs.joinGame(creatorId);
        });

        canny.userPanel.onAddNewUser(function (name, color) {

            canny.layout.control.overlay('login').close();

            user.setName(name);
            user.setColor(color);

            emitter.up.join(name);

            // start a new game
            emitter.gs.startNewGame({
                gametype : C.GAME_TYPES.SINGLE,
                gameVariant : C.GAME_VARIANTS.moreAndMore,
                numberOfSymbols : 30
            }, function (gameId) {
                console.log(gameId);
            });
        });

    });
});
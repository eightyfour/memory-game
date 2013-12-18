/*global */
/*jslint browser: true */
/**
 *
 * @type {*}
 */
var domready = require('domready'),
    domOpts = require('dom-opts'),
    shoe = require('shoe'),
    dnode = require('dnode'),
    toast = require('message-toast'),
    C = require('../../lib/CONSTANT.js'),

    user = {
        id : undefined,
        name : ''
    },
    stream = shoe('/memory'),
    d = dnode();

// publish domOpts
window.domOpts = domOpts;
window.userPool = {};
// create game namespace
window.game = window.game || {};

domready(function () {
    "use strict";
    window.game.memo = new function () {
        var that = this,
            gameEvents = {
                rootClickedQueue : [],
                clearRootClickedQueue : function () {
                    var fc = function () {};
                    while (fc !== undefined) {
                        fc = this.rootClickedQueue.pop();
                        fc && fc();
                    }
                }
            },
            selectors = {
                templates : "templates",
                game : {
                    rootId : 'board',
                    state : {
                        open : 'open',
                        hidden : 'hidden',
                        empty : 'empty'
                    }
                },
                env : {
                    boardMessage : 'boardMessage',
                    gameStatsPanel : {
                        root : 'gameStatsPanel',
                        doubleSelected : 'doubleSelected',
                        matches : 'matches'
                    }
                }
            },
            getImage = function (type) {
                var img = new Image();
                img.src = 'images/animals/' + type + '.png';
                img.alt = type;
                img.width = 100;
                img.height = 100;
                return img;
            },
            fadeoutImage = function (img) {
                var delay = 20,
                    pixelSteps = 2,
                    scaleImage = function () {
                        var w = img.width,
                            h = img.height,
                            wDone = false,
                            hDone = false;
                        if (w > 0) {
                            img.width = w - pixelSteps;
                            img.style.paddingTop = (parseInt(img.style.paddingTop || 0, 10) + pixelSteps / 2) + 'px';
                        } else {
                            wDone = true;
                        }
                        if (h > 0) {
                            img.height = h - pixelSteps;
                            img.style.paddingLeft = (parseInt(img.style.paddingLeft || 0, 10) + pixelSteps / 2) + 'px';

                        } else {
                            hDone = true;
                        }
                        if (!wDone && !hDone) {
                            setTimeout(scaleImage, delay);
                        } else {
                            img.parentNode.removeChild(img);
                        }
                    };
                scaleImage();
            },
            gui = {
                gameLoadingMessage : {
                    show : function (msg) {
    //                    .. show message that game loads new
                        var node = document.getElementById(selectors.env.boardMessage);
                        node.innerText = msg;
                        node.style.visibility = 'visible';
                    },
                    hide : function () {
                        var node = document.getElementById(selectors.env.boardMessage);
                        node.style.opacity = '1';
                        (function fadeOut(oldOp) {
                            var op = oldOp - 0.1;
                            if (op > 0) {
                                node.style.opacity = op;
                                setTimeout(function () {fadeOut(op); }, 100);
                            } else {
                                node.innerText = "";
                                node.style.visibility = 'hidden';
                                node.style.opacity = '1';
                            }
                        }(1));

                    }
                },
                userPool : {
                    select : {
                        root : 'userPool',
                        idPostfix : 'u'
                    },
                    addNewUser : function (user) {
                        var node = domOpts.createElement('div',
                            this.select.idPostfix + user.uId).domAppendTo(this.select.root);
                        node.innerText = user.name;
                        console.log('addNewUser', user);
                    },
                    removeUser : function (user) {
                        var node = document.getElementById(this.select.idPostfix + user.uId);
                        if (node) {
                            node.domRemove();
                        }
                        console.log('remove User', user);
                    }
                },
                gameSpecific : {
                    showOpenGame : function (value) {
                        var root = document.getElementById('actualGames'),
                            li = domOpts.createElement('li', 'openGame_' + value.gameId);
                        li.addEventListener('click', function Select(e) {
                            console.log('Try join game: ' + value.creator.uId + " as user with ID: " + user.id);
                            that.askServer.joinGame(value.creator.uId);
                        }, false);
                        li.innerText = value.gameId;
                        li.domAppendTo(root);
                    },
                    removeOpenGame : function (value) {
                        document.getElementById('openGame_' + value.gameId).domRemove();
                    },
                    startGame : function (obj) {
                        if (obj.users[user.id].turn) {
                            toast.showMessage('You can start the game');
                        }
                    },
                    setTurn : function (bool) {
                        var node = document.getElementById(selectors.env.boardMessage), msg, bgc;

                        if (bool) {
                            msg = "It's your turn";
                            bgc = "#adff2f";
                        } else {
                            msg = "...wait for opponent";
                            bgc = "#708090";
                        }
                        node.innerText = msg;
                        node.style.backgroundColor = bgc;
                        node.style.visibility = 'visible';
                    }
                }
            };

        this.currentGameId = '';
        //ui for the page interactions - not for the game (board)
        this.ui = {
            createNewGame : function () {
                var numberOfSymbols = document.getElementById('numberOfSymbols').value,
                    gameVariant = document.getElementById('gameVariant').value;
                that.askServer.startNewGame({
                    gametype : C.GAME_TYPES.SINGLE,
                    numberOfSymbols : numberOfSymbols,
                    gameVariant : gameVariant
                }, function (gameId) {
                    that.currentGameId = gameId;
                });
            },
            doSomeOtherPageinteractions : function () {}
        };

        this.con = {
            connection : undefined,
            server : {},
            client : undefined,
            ui : undefined,
            error : undefined
        };
        // bound server methods here - talk to server
        this.askServer = {};
        // server callees called from server side
        this.serverCallees = (function () {

            var class_postfix = "nr_",
                config = {
                    createNewBoardDelay : 2000
                },
                addClickEvent = function (card) {
                    card.addEventListener('click', function Select(e) {
                        var id = this.getAttribute('id'),
                            position = id.split(class_postfix)[1];
                        window.game.memo.askServer.takeCard(position);
                        console.log('Ask server for take a card');
                    }, false);
                },
                serverMethods = {
                    addUser : function (user) {
                        gui.userPool.addNewUser(user);
                    },
                    removeUser : function (user) {
                        gui.userPool.removeUser(user);
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
                        var node, data;
                        if (gameStats.hasOwnProperty('doubleSelected')) {
                            node = document.getElementById(selectors.env.gameStatsPanel.root);
                            data = node.getElementsByClassName(selectors.env.gameStatsPanel.doubleSelected)[0];
                            data.getElementsByClassName('data')[0].innerText =  gameStats.doubleSelected;
                        }
                        if (gameStats.hasOwnProperty('matches')) {
                            node = document.getElementById(selectors.env.gameStatsPanel.root);
                            data = node.getElementsByClassName(selectors.env.gameStatsPanel.matches)[0];
                            data.getElementsByClassName('data')[0].innerText =  gameStats.matches;
                        }

                    },
                    gameEnds : function (gameConf, gameState, gameStats) {
                        console.log('GAME STATE IS: ' + gameState);
                    },
                    /**
                     * handle list of current games
                     */
                    gameOverview : function (key, value) {
                        gui.gameSpecific[key](value);
                    },
                    showMatchedCard : function (gameConf, firstCard, secondCard) {
                        serverMethods.showCard(gameConf, secondCard);
                        setTimeout(function () {
                            // TODO check wich type is used - than use eqeqeq
                            if (gameConf.gameId === parseInt(document.getElementById(selectors.game.rootId).getAttribute('gameId'), 10)) {
                                serverMethods.removeCard(gameConf, firstCard);
                                serverMethods.removeCard(gameConf, secondCard);
                            }
                        }, 2e3);
                    },
                    showCard : function (gameConf, card) {
                        var cardNode = document.getElementById(class_postfix + card.position);
                        cardNode.domRemoveClass(selectors.game.state.hidden).domAddClass(card.type + ' ' + selectors.game.state.open);
                        cardNode.appendChild(getImage(card.type));
                    },
                    hideCards : function (gameConf, cards) {
                        cards.forEach(function (card) {
                            var cardNode = document.getElementById(class_postfix + card.position),
                                callMeHasBeenCalled = false,
                                timer,
                                callMe = function () {
                                    if (callMeHasBeenCalled === false) {
                                        timer.hasOwnProperty('clearTimeout') && timer.clearTimeout();
                                        cardNode.domRemoveClass(card.type + ' ' + selectors.game.state.open).domAddClass(selectors.game.state.hidden);
                                        cardNode.innerHTML = '';
                                        callMeHasBeenCalled = true;
                                    }
                                };
                            timer = setTimeout(function () {
                                callMe();
                            }, 2e3);
                            gameEvents.rootClickedQueue.push(callMe);
                        });
                    },
                    removeCard : function (gameConf, card) {
                        var cardNode = document.getElementById(class_postfix + card.position);
                        if (cardNode) {
                            cardNode.domRemoveClass().domAddClass(selectors.game.state.empty + ' card');
                            fadeoutImage(cardNode.children[0]);
                        } else {
                            // TODO find out why this is called - could be a bug
                            console.log('No cardnode was found');
                        }
                    },
                    clearBoard : function () {
                        var root = document.getElementById(selectors.game.rootId),
                            cards = Array.prototype.slice.call(document.getElementById(selectors.game.rootId).children);
                        cards.forEach(function (node) {
                            root.removeChild(node);
                        });
                    },
                    generateBoard : function (gameConf, numberOfcards) {
                        var root = document.getElementById(selectors.game.rootId);
                        serverMethods.clearBoard();

                        gui.gameLoadingMessage.show('New game starts in some seconds');
                        setTimeout(function () {
                            var i, node;
                            gui.gameLoadingMessage.hide();
                            root.setAttribute('gameId', gameConf.gameId);
                            for (i = 0; i < numberOfcards; i++) {
                                node = domOpts.createElement('div',
                                    class_postfix + i, 'card').domAppendTo(root);
                                addClickEvent(node);
                            }
                        }, config.createNewBoardDelay);

                    }
                };
            // register click lister to board root
            document.getElementById(selectors.game.rootId).
                addEventListener('click', function ClickListener() {
                    console.log('Register a click');
                    gameEvents.clearRootClickedQueue();
                }, false);

            return serverMethods;
        }());
    };


    d.on('remote', function (server) {

        server.init(window.game.memo.serverCallees, function (sId) {
            user.id = sId;
        });
        window.game.memo.askServer = server.gs;
        window.userPool = server.up;

        // rest should be removed from here:

        // register user
        user.name = window.prompt('Enter your name please');
        window.userPool.join(user.name);

        // start a new game
        window.game.memo.askServer.startNewGame({
            gametype : C.GAME_TYPES.SINGLE,
            gameVariant : C.GAME_VARIANTS.moreAndMore,
            numberOfSymbols : 30
        }, function (gameId) {
            window.game.memo.currentGameId = gameId;
            console.log(window.game);
        });

    });
    d.pipe(stream).pipe(d);
});
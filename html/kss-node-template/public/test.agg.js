(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"../../lib/CONSTANT.js":8}],2:[function(require,module,exports){
/**
 * Created by han on 31.08.14.
 */

var rink = function () {

    var rootNode,
        events = {
            callCardClick : function () {}
        },
        class_postfix = "nr_",
        config = {
            createNewBoardDelay : 2000
        },
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
                    empty : 'empty',
                    matched : 'matched'
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
        addClickEvent = function (card) {
            card.addEventListener('click', function Select(e) {
                var id = this.getAttribute('id'),
                    position = id.split(class_postfix)[1];
                events.callCardClick(position);
                console.log('Ask server for take a card');
            }, false);
        },
        emitter = {
            cards : {
                show : function (gameConf, card) {
                    // TODO is no state passed from server than the card was already matched - add a state for matched cards (is this the curios empty state?)
                    var cardNode = document.getElementById(class_postfix + card.position);
//                    if (!card.hasOwnProperty('state')) {
//                        cardNode.domAddClass(selectors.game.state.matched);
//                    }
                    cardNode.innerHTML = '';
                    cardNode.domRemoveClass(selectors.game.state.hidden).domAddClass(card.type + ' ' + selectors.game.state.open);
                    cardNode.appendChild(getImage(card.type));
                },
                match : function (gameConf, firstCard, secondCard) {
                    emitter.cards.show(gameConf, secondCard);
                    setTimeout(function () {
                        // TODO check wich type is used - than use eqeqeq
                        if (gameConf.gameId === parseInt(rootNode.getAttribute('gameId'), 10)) {
                            emitter.cards.remove(gameConf, firstCard);
                            emitter.cards.remove(gameConf, secondCard);
                        }
                    }, 2e3);
                },
                hide : function (gameConf, cards) {
                    console.log('CALL HIDE', cards);
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
                remove : function (gameConf, card) {
                    var cardNode = document.getElementById(class_postfix + card.position);
                    if (cardNode) {
                        cardNode.domRemoveClass().domAddClass(selectors.game.state.empty + ' card');
                        fadeoutImage(cardNode.children[0]);
                    } else {
                        // TODO find out why this is called - could be a bug
                        console.log('No cardnode was found');
                    }
                }
            },
            board : {
                clear : function () {
                    var cards = Array.prototype.slice.call(rootNode.children);
                    cards.forEach(function (node) {
                        rootNode.removeChild(node);
                    });
                },
                generateNew : function (gameConf, numberOfcards) {
                    emitter.board.clear();

                    canny.rinkMessages.show('New game starts in some seconds');

                    setTimeout(function () {
                        var i, node;
                        canny.rinkMessages.hide();
                        rootNode.setAttribute('gameId', gameConf.gameId);
                        for (i = 0; i < numberOfcards; i++) {
                            node = domOpts.createElement('div',
                                    class_postfix + i, 'card').domAppendTo(rootNode);
                            addClickEvent(node);
                        }
                    }, config.createNewBoardDelay);
                }
            }
        };

    return {
        onCardClick : function (fc) {
            events.callCardClick = fc;
        },
        emitter : emitter,
        add : function (node, attr) {
            rootNode = node;
        },
        ready : function () {
            // register click lister to board root
            rootNode.addEventListener('click', function ClickListener() {
                console.log('Register a click');
                gameEvents.clearRootClickedQueue();
            }, false);
        }
    }
};

module.exports = rink;
},{}],3:[function(require,module,exports){
/**
 * Created by han on 31.08.14.
 */
var rinkMessages = function () {
    var rootNode,
        C = {
            OWN_TURN : 'c-own-turn',
            OPPONENT_TURN : 'c-opponent-turn'
        };

    function handleState(state) {
        Object.keys(C).forEach(function (key) {
            rootNode.classList.remove(C[key]);
        });
        if (state && C.hasOwnProperty(state)) {
            rootNode.classList.add(state);
        } else {
            console.log('rinkMessages do not support state: ', state);
        }
    }
    return {
        C : {
            OWN_TURN : 'c-own-turn',
            OPPONENT_TURN : 'c-opponent-turn'
        },
        show : function (msg, state) {
            handleState(state);
            // .. show message that game loads new
            rootNode.innerText = msg;
            rootNode.style.visibility = 'visible';
        },
        hide : function () {
            rootNode.style.opacity = '1';
            (function fadeOut(oldOp) {
                var op = oldOp - 0.1;
                if (op > 0) {
                    rootNode.style.opacity = op;
                    setTimeout(function () {fadeOut(op); }, 100);
                } else {
                    rootNode.innerText = "";
                    rootNode.style.visibility = 'hidden';
                    rootNode.style.opacity = '1';
                }
            }(1));

        },
        add : function(node, attr) {
            rootNode = node;
        }
    }
};

module.exports = rinkMessages;
},{}],4:[function(require,module,exports){
/**
 * Update the stats for the rink
 */
var rinkStats = function () {

    var rootNode,
        whiskerData = {
            update : function () {},
            // part of whisker api
            whiskerUpdate : function (fc) {
                whiskerData.update = fc;
            },
            // message definitions
            doubleSelected : 0,
            matches : 0
        };
    return {
        /**
         * Common reset method to reset the module state
         */
        reset : function () {
            whiskerData.doubleSelected = '0';
            whiskerData.matches = '0';
            whiskerData.update(whiskerData);
        },
        /**
         * Update the texts with whisker
         * @returns {{update: update, whiskerUpdate: whiskerUpdate, doubleSelected: number, matches: number}}
         */
        data : function () {
            return whiskerData;
        },
        add : function (node, attr) {
            rootNode = node;
        },
        emitter : {
            doubleSelected : function (msg) {
                whiskerData.doubleSelected = msg;
                whiskerData.update(whiskerData);
            },
            matches : function (msg) {
                whiskerData.matches = msg;
                whiskerData.update(whiskerData);
            }
        }
    }
};
module.exports = rinkStats;
},{}],5:[function(require,module,exports){
/**
 * Created by han on 31.08.14.
 */
var userPanel = function () {

    function submit() {
        // check if field is valid and remove overlay...
        if (brain.inputName.isValid()) {
            events.addNewUser(brain.inputName.getValue(), '#00ff00');
        }
    }


    var select = {
        root : 'userPanel',
        idPostfix : 'u'
    },
    events = {
        addNewUser : function () {}
    },
    rootNode,
    brain = {
        colorChooser : (function () {
            var selectedColor,
                colors = ['#000','#fff'];
            function genColorItems(color) {
                var node = document.createElement('div');
                node.style.backgroundColor = color;
                node.addEventListener('click', function () {
                    selectedColor = color;
                    [].slice.call(node.parentNode.children).forEach(function (n) {
                        n.classList.remove('selected');
                    });
                    node.classList.add('selected');
                });
                return node;
            }
            return {
                init : function (node) {
                    var frag = document.createDocumentFragment();
                    colors.forEach(function (color) {
                        frag.appendChild(genColorItems(color));
                    });
                    node.appendChild(frag);
                }
            }
        }()),
        inputName : (function (node) {
            var inputNode;
            return {
                isValid : function () {
                    return inputNode.value ? true : false;
                },
                getValue : function () {
                    return inputNode.value;
                },
                init : function (node) {
                    inputNode = node;
                }
            }
        }()),
        inputButton : {
            init: function (node) {
                node.addEventListener('click', submit)
            }
        }
    };

    return {
        add : function (node, attr) {
            if(brain.hasOwnProperty(attr)) {
                brain[attr].init(node);
            }
        },
        onAddNewUser : function (fc) {
            console.log('REGISTER onAddNewUser');
            events.addNewUser = fc;
            // register user
//            var name = window.prompt('Enter your name please');
//            events.addNewUser(name, '#00ff00');
        },
        ready : function () {

        }
    }
};

module.exports = userPanel;
},{}],6:[function(require,module,exports){
/**
 * Created by han on 31.08.14.
 */
var userPool = function () {
    var select = {
        idPostfix : 'u'
    },
    rootNode;

    return {
        add : function (node, attr) {
            rootNode = node;
        },
        emitter : {
            addNewUser : function (user) {
                var node = document.getElementById(select.idPostfix + user.uId),
                    span;

                if (!node) {
                    node = domOpts.createElement('div',
                        select.idPostfix + user.uId,
                        'c-user').domAppendTo(rootNode);
                    span = domOpts.createElement('span').domAppendTo(node);
                } else {
                    span = node.querySelector('span');
                }

                span.innerText = user.name;
                console.log('addNewUser', user);
            },
            removeUser : function (user) {
                var node = document.getElementById(select.idPostfix + user.uId);
                if (node) {
                    node.domRemove();
                }
                console.log('remove User', user);
            }
        }
    }
};

module.exports = userPool;
},{}],7:[function(require,module,exports){
var canny = require('canny');
window.canny = canny;
canny.add('userPool', require('../js/c-userPool')());
canny.add('userPanel', require('../js/c-userPanel')());
//canny.add('layout', require('./c-layout')());
//canny.add('lobby', require('./c-lobby')());
canny.add('panel', require('../js/c-panel')());
canny.add('rinkMessages', require('../js/c-rinkMessages')());
canny.add('rinkStats', require('../js/c-rinkStats')());
canny.add('rink', require('../js/c-rink')());
},{"../js/c-panel":1,"../js/c-rink":2,"../js/c-rinkMessages":3,"../js/c-rinkStats":4,"../js/c-userPanel":5,"../js/c-userPool":6,"canny":9}],8:[function(require,module,exports){

/*
 Should synced to client
 */
module.exports = {
    CARD_STATE : {
        hidden: -1,
        open : 0,
        closed: 1
    },
    GAME_TYPES : {
        SINGLE : 0,
        MULTIPLAYER : 1
    },
    GAMESTATE : {
        boardNotready : -2,
        waitForOpponent : -1,
        play : 0,
        won : 1,
        lost : 2,
        draw : 3
    },
    GAME_VARIANTS : {
        normal : 0,
        moreAndMore : 1,
        multiplayer : 2
    }
};

},{}],9:[function(require,module,exports){
/*global */
/*jslint browser: true*/
/**
 * TODO
 * If canny knows his own URL than canny could load none registered modules afterwords from his own
 * modules folder (can also build as configurable extension adapted to the body).
 * E.g.: canny-mod="moduleLoader" canny-var={'cannyPath':URL_FROM_CANNY, 'unknownMods':LOAD_FROM_OTHER_URL}
 *
 *
 * canny-var is deprecated: please use just the module name instead like:
 * E.g.: canny-mod="mod1 mod2" canny-mod1={'foo':'123456', 'bar':'654321'} canny-mod2="mod2Property"
 *
 * ---------------------------------------------------------------------------- eightyfour
 */
(function (global) {
    "use strict";
    var canny = (function () {
        var readyQueue = [],
            readyQueueInit = false,
            moduleQueue = [], // save modules to call the ready method once
            callMethQueue = function (queue) {
                (function reduce() {
                    var fc = queue.pop();
                    if (fc) {
                        fc();
                        reduce();
                    } else {
                        queue = [];
                    }
                }());
            },
            parseNode = function (node, name, cb) {
                var that = this, gdModuleChildren = [].slice.call(node.querySelectorAll('[' + name + '-mod]')), prepareReadyQueue = {};

                gdModuleChildren.forEach(function (node) {
                    var attribute = node.getAttribute(name + '-mod'), attr, viewPart, attributes, cannyVar;

                    attributes = attribute.split(' ');

                    attributes.forEach(function (eachAttr) {
                        if (that[eachAttr]) {
                            if (node.getAttribute(name + '-mod')) {
                                if (node.getAttribute(name + '-' + eachAttr)) {
                                    cannyVar = node.getAttribute(name + '-' + eachAttr);
                                } else {
                                    cannyVar = node.getAttribute(name + '-var');
                                }
                                if (cannyVar) {
                                    attr = cannyVar.split("\'").join('\"');
                                    if (/:/.test(attr)) {
                                        // could be a JSON
                                        try {
                                            viewPart = JSON.parse(attr);
                                        } catch (ex) {
                                            console.error("canny can't parse passed JSON for module: " + eachAttr, node);
                                        }
                                    } else {
                                        viewPart = attr;
                                    }
                                }
                            }
                            // has module a ready function than save it for calling
                            if (that[eachAttr].hasOwnProperty('ready')) {
                                // TODO or call it immediately?
                                prepareReadyQueue[eachAttr] = that[eachAttr].ready;
                            }
                            if (that.hasOwnProperty(eachAttr)) {
                                that[eachAttr].add(node, viewPart);
                            }
                        } else {
                            console.warn('canny parse: module with name ´' + eachAttr + '´ is not registered');
                        }
                    });
                });
                // add ready callback to moduleQueue
                Object.keys(prepareReadyQueue).forEach(function (name) {
                    moduleQueue.push(prepareReadyQueue[name]);
                });
                cb && cb();
            };

        document.addEventListener('DOMContentLoaded', function cannyDomLoad() {
            document.removeEventListener('DOMContentLoaded', cannyDomLoad);

            parseNode.apply(canny, [document, 'canny']);

            callMethQueue(moduleQueue);
            // call registered ready functions
            readyQueueInit = true;
            callMethQueue(readyQueue);
        }, false);

        return {
            add : function (name, module) {
                if (!this.hasOwnProperty(name)) {
                    this[name] = module;
                } else {
                    console.error('canny: Try to register module with name ' + name + ' twice');
                }
            },
            ready : function (fc) {
                if (!readyQueueInit) {
                    readyQueue.push(fc);
                } else {
                    fc();
                }
            },
            cannyParse : function (node, name, cb) {
                // TODO needs a callback
                if (typeof name === 'function') {
                    cb = name;
                    name = "canny";
                }
                parseNode.apply(this || canny, [node, name || 'canny', function () {
                    callMethQueue(moduleQueue);
                    cb && cb();
                }]);
            }
        };
    }());
    // export as module or bind to global
    if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) { module.exports = canny; } else {global.canny = canny; }
}(this));

},{}]},{},[7])
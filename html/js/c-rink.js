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
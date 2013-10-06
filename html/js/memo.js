/**
 *
 * @type {*}
 */
var domready = require('domready');
var domOpts = require('dom-opts');
var shoe = require('shoe');
var dnode = require('dnode');
var toast = require('message-toast');
var C = require('../../lib/CONSTANT.js');

var user = {
    id : undefined,
    name : ''
}
var stream = shoe('/memory');
var d = dnode();

// publish domOpts
window.domOpts = domOpts;
// create game namespace
window.game = window.game || {};

domready(function() {

    window.game.memo = new function(){
        var that = this,
            gameEvents = {
                rootClickedQueue : [],
                clearRootClickedQueue : function(){
                    var fc = function(){};
                    while(fc != undefined){
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
                    scaleImage = function(){
                        var w = img.width,
                            h = img.height,wDone = false,hDone = false;
                        if (w > 0) {
                            img.width = w-pixelSteps;
                            img.style.paddingTop = (parseInt(img.style.paddingTop ? img.style.paddingTop : 0, 10) + pixelSteps/2)+'px';
                        } else {
                            wDone = true;
                        }
                        if (h > 0) {
                            img.height = h-pixelSteps;
                            img.style.paddingLeft = (parseInt(img.style.paddingLeft ? img.style.paddingLeft : 0,10) + pixelSteps/2)+'px';

                        } else {
                            hDone = true;
                        }
                        if (!wDone && !hDone) {
                            setTimeout(scaleImage,delay);
                        } else {
                            img.parentNode.removeChild(img);
                        }
                    }
                scaleImage();
            };

        this.currentGameId;
        //ui for the page interactions - not for the game (board)
        this.ui = {
            createNewGame : function(){
                var numberOfSymbols = document.getElementById('numberOfSymbols').value;
                that.askServer.startNewGame(user.id,
                    { gametype : C.GAME_TYPES.SINGLE, numberOfSymbols : numberOfSymbols },
                    function(gameId){
                    that.currentGameId = gameId;
                });
            },
            doSomeOtherPageinteractions : function(){}
        }

        this.con = {
            connection : undefined,
            server : {},
            client : undefined,
            ui : undefined,
            error : undefined
        }
        // bound server methods here - talk to server
        this.askServer;
        // server callees called from server side
        this.serverCallees = (function(){

            var class_postfix = "nr_",
                addClickEvent = function(card){
                    card.addEventListener('click',function Select(e){
                        var id = this.getAttribute('id');
                        var position = id.split(class_postfix)[1];
                        game.memo.askServer.takeCard(user.id,position);
                        console.log('Ask server for take a card');
                    },false)
                },
                serverMethods = {
                    showToast : toast.showMessage,
                    gameEnds : function(gameConf,gameState,gameStats){
                        console.log('GAME STATE IS: '+gameState);
                    },
                    showMatchedCard : function(gameConf,firstCard,secondCard){
                        serverMethods.showCard(gameConf,secondCard);
                        setTimeout(function(){
                            if(gameConf.gameId == document.getElementById(selectors.game.rootId).getAttribute('gameId')){
                                serverMethods.removeCard(gameConf,firstCard);
                                serverMethods.removeCard(gameConf,secondCard);
                            }
                        },2e3);
                    },
                    showCard : function(gameConf,card){
                        var cardNode = document.getElementById(class_postfix+card.position);
                        cardNode.domRemoveClass(selectors.game.state.hidden).domAddClass(card.type+' '+selectors.game.state.open);
                        cardNode.appendChild(getImage(card.type));
                    },
                    hideCard : function(gameConf,card){
                        var cardNode = document.getElementById(class_postfix+card.position);
                        var callMeHasBeenCalled = false;
                        var callMe = function(){
                            if(callMeHasBeenCalled === false){
                                timer.hasOwnProperty('clearTimeout') && timer.clearTimeout();
                                cardNode.domRemoveClass(card.type+ ' '+selectors.game.state.open).domAddClass(selectors.game.state.hidden);
                                cardNode.innerHTML = '';
                                callMeHasBeenCalled = true;
                            }
                        }
                        var timer = setTimeout(function(){
                            callMe();
                        },2e3);
                        gameEvents.rootClickedQueue.push(callMe);
                    },
                    removeCard : function(gameConf,card){
                        var cardNode = document.getElementById(class_postfix+card.position);
                        cardNode.domRemoveClass().domAddClass(selectors.game.state.empty+' card');
                        fadeoutImage(cardNode.children[0])
                    },
                    clearBoard : function(){
                        var root = document.getElementById(selectors.game.rootId),
                            cards = Array.prototype.slice.call(document.getElementById(selectors.game.rootId).children);
                        cards.forEach(function(node){
                            root.removeChild(node);
                        });
                    },
                    generateBoard : function(gameConf,numberOfcards){
                        var root = document.getElementById(selectors.game.rootId);
                        root.setAttribute('gameId',gameConf.gameId);
                        for (var i = 0; i < numberOfcards; i++) {
                            var node = domOpts.createElement('div',
                                class_postfix + i,'card').domAppendTo(root);
                            addClickEvent(node);
                        }
                    }
                };
            // register click lister to board root
            document.getElementById(selectors.game.rootId).
                addEventListener('click',function ClickListener(){
                    console.log('Register a click');
                    gameEvents.clearRootClickedQueue();
                },false);

            return serverMethods;
        })();
    };


    user.name = window.prompt('Enter your name please');

    d.on('remote', function (server) {
        game.memo.askServer = server;
        console.log('Connected!',server);
        game.memo.askServer.registerUser( game.memo.serverCallees,user, function(id){
            user.id = id;
            game.memo.askServer.startNewGame(user.id,{ gametype : C.GAME_TYPES.SINGLE, gameVariant : C.GAME_VARIANTS.moreAndMore, numberOfSymbols : 30 },function(gameId){
                game.memo.currentGameId = gameId;
            });
        });
    });
    d.pipe(stream).pipe(d);
});
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
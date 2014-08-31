/**
 * Created by han on 31.08.14.
 */

var layout = function () {

    var domMods = {
            rightNav : (function () {
                var node,
                    show = function () {
                        node.classList.add('c-show');
                    },
                    hide = function () {
                        node.classList.remove('c-show');
                    };
                return {
                    init : function (elem) {
                        node = elem;
                    },
                    show : show,
                    hide : hide,
                    toggle : function () {
                        if (node.classList.contains('c-show' )) {
                            hide();
                        } else {
                            show();
                        }
                    }
                }
            }()),
            leftNav : (function () {

            }())
        },
        controlModules = {
            toggleRightNav : function (node) {
                node.addEventListener('click', domMods.rightNav.toggle);
            }
        };
    return {
        control : domMods,
        add : function (node, attr) {
            console.log('ADD c-layout');
            if (domMods.hasOwnProperty(attr)){
                domMods[attr].init(node);
            } else if (controlModules.hasOwnProperty(attr)) {
                controlModules[attr](node);
            }
        }
    }
};

module.exports = layout;
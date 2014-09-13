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
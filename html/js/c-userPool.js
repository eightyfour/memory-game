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
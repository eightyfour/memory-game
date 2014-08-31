/**
 * Created by han on 31.08.14.
 */
var userPool = function () {
    var select = {
        root : 'userPool',
        idPostfix : 'u'
    },
    rootNode;

    return {
        add : function (node, attr) {
            rootNode = node;
        },
        emitter : {
            addNewUser : function (user) {
                var node = domOpts.createElement('div',
                        select.idPostfix + user.uId).domAppendTo(rootNode || select.root);
                node.innerText = user.name;
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
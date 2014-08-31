/**
 * Created by han on 31.08.14.
 */

var rinkStats = function () {

    var rootNode,
        gameStatsPanel = {
            doubleSelected : 'doubleSelected',
            matches : 'matches'
        };
    return {
        add : function (node, attr) {
            rootNode = node;
        },
        emitter : {
            doubleSelected : function (msg) {
                var data = rootNode.getElementsByClassName(gameStatsPanel.doubleSelected)[0];
                data.getElementsByClassName('data')[0].innerText = msg;
            },
            matches : function (msg) {
                var data = rootNode.getElementsByClassName(gameStatsPanel.matches)[0];
                data.getElementsByClassName('data')[0].innerText =  msg;
            }
        }
    }
};
module.exports = rinkStats;
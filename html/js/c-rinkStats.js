/**
 * Update the stats for the rink
 */
var rinkStats = function () {

    var rootNode,
        whiskerUpdate,
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
        data : function (fc) {
            whiskerUpdate = fc;
            whiskerUpdate('data', {});
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
                whiskerUpdate('data', whiskerData);
            }
        }
    }
};
module.exports = rinkStats;
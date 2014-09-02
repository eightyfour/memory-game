/**
 * Created by han on 01.09.14.
 */

/**
 * register modules which needs to reset in a specific state
 */
var reset = (function () {
    var resetRinkQueue = [];

    function callQueue(queue) {
        for (var i = 0; i < queue.length; i++) {
            queue[i]();
        }
    }
    return {
        register : {
            /**
             * pass many object as arguments which implements the reset method
             */
            resetRink : function (params) {
                var args = [].slice.call(arguments);
                args.forEach(function (obj) {
                    if (obj.hasOwnProperty('reset')) {
                        console.log('ADD RESET FOR OBJ:', obj);
                        resetRinkQueue.push(obj.reset);
                    }
                });
            }
        },
        trigger : {
            resetRink : function () {
                callQueue(resetRinkQueue);
            }
        }
    }
}());

module.exports = reset;
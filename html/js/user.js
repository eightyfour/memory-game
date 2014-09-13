/**
 * Created by han on 31.08.14.
 */

var user = (function () {
    var id,
        name = '',
        color;

    return {
        setUId : function (uId) {
            id = uId;
        },
        getUId : function () {
            return id;
        },
        setName : function (uName) {
            name = uName;
        },
        getName : function () {
            return name;
        },
        setColor : function (colorCode) {
            color = colorCode;
        },
        getColor : function () {
            return color;
        }
    }
}());

module.exports = user;
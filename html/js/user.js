/**
 * Created by han on 31.08.14.
 */

var user = (function () {
    var id,
        name = '';
    console.log('CREATE USER INSTANCE');
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
        }
    }
}());

module.exports = user;
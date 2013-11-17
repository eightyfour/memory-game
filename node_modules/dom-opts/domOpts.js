/*global HTMLElement */
/*jslint browser: true */

var domOpts = {};

domOpts.params = (function () {
    "use strict";
    var params = {}, i, nv, parts;
    if (location.search) {
        parts = location.search.substring(1).split('&');
        for (i = 0; i < parts.length; i++) {
            nv = parts[i].split('=');
            if (nv[0]) {
                params[nv[0]] = nv[1] || true;
            }
        }
    }
    return params;
}());

domOpts.createElement = function (tag, id, classes) {
    "use strict";
    var newNode = document.createElement(tag);
    if (id) {newNode.setAttribute('id', id); }
    if (classes) {newNode.setAttribute('class', classes); }
    return newNode;
};
module.exports =  domOpts;

// dom operations:
HTMLElement.prototype.domAddClass = function (addClasses) {
    "use strict";
    console.log('add class und so');
    this.setAttribute('class', this.getAttribute('class') + ' ' + addClasses);
    return this;
};

HTMLElement.prototype.domRemoveClass = function (removeableClasses) {
    "use strict";
    var removeClasses = (removeableClasses && removeableClasses.split(' ')) || this.getAttribute('class').split(' '),
        currentClasses = this.getAttribute('class').split(' '),
        i,
        idx;
    for (i = 0; i < removeClasses.length; i++) {
        idx = currentClasses.indexOf(removeClasses[i]);
        if (idx >= 0) {
            currentClasses = currentClasses.slice(0, idx).concat(currentClasses.slice(idx + 1, currentClasses.length - 1));
        }
    }
    this.setAttribute('class', currentClasses.join(' '));
    return this;
};

HTMLElement.prototype.domRemove = function () {
    "use strict";
    this.parentNode.removeChild(this);
};

HTMLElement.prototype.domAppendTo = function (elem) {
    "use strict";
    var node = elem;
    if (typeof node === 'string') {
        node = document.getElementById(node);
    }
    node.appendChild(this);
    return this;
};
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
        },
        domAdvancedMods = {
            /**
             * attr {overlay(id)[string], groupId[string], position[number], show[boolean]}
             */
            overlay : (function () {
                var overlays = {},
                    groups = {},
                    current;
                function Overlay(node, id, groupId, position) {
                    this.node = node;
                    this.id = id;
                    this.groupId = groupId;
                    this.position = position;
                }
                return {
                    close : function (id) {
                        overlays[id].node.style.display = 'none';
                    },
                    moveIn : function (id) {

                    },
                    moveOut : function (id) {

                    },
                    next : function () {
                        if (current) {
                            overlays[current].groupId;
                        } else {
                            console.log('No active overlay found');
                        }
                    },
                    init : function (node, attr) {
                        var id = attr.overlay;
                        overlays[id] = new Overlay(node, id, attr.groupId, attr.position);

                        if (attr.show === false || attr.show === 'false') {
                            // call hide
                            node.style.display = 'none';
                        }

                        // handle groupId
                        if (attr.hasOwnProperty('groupId')) {
                            if (!groupId.hasOwnProperty(attr.groupId)) {
                                 groupId[attr.groupId] = [id];
                            } else {
                                // sort in with configured position if it has position
                                if (attr.position) {
                                    groupId[attr.groupId] = (function (array, i) {
                                        var a = [];
                                        for (var j = 0; j < array.length; j++) {
                                            if (overlays[id].position > i) {
                                                a.push(id);
                                                a.push(array[j]);
                                                break;
                                            }
                                            a.push(array[j]);
                                        }
                                        return a;
                                    }(groupId[attr.groupId], attr.position));
                                } else {
                                    groupId[attr.groupId].push(attr,overlay);
                                }

                                console.log('groupId[attr.groupId]', groupId[attr.groupId]);
                            }
                        }
                    }
                }
            }())
        },
        control = {
            rightNav : {
                show : domMods.rightNav.show,
                hide : domMods.rightNav.hide,
                toggle : domMods.rightNav.toggle
            },
            overlay : function (memId) {
                return {
                    close : function (id) {
                        domAdvancedMods.overlay.close(id || memId);
                    }
                }
            }

        };
    return {
        control : control,
        add : function (node, attr) {
            if (typeof attr === 'object') {
                if (attr.hasOwnProperty('overlay')) {
                    domAdvancedMods.overlay.init(node, attr);
                }
            } else if (domMods.hasOwnProperty(attr)){
                domMods[attr].init(node);
            } else if (controlModules.hasOwnProperty(attr)) {
                controlModules[attr](node);
            }
        }
    }
};

module.exports = layout;
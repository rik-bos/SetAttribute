/*global logger*/
/*
    SetAttribute
    ========================

    @file      : SetAttribute.js
    @version   : 1.0.0
    @author    : Rik Bos
    @date      : 2016-09-19
    @copyright : TimeSeries 2016
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    // "mxui/dom",
    // "dojo/dom",
    // "dojo/dom-prop",
    // "dojo/dom-geometry",
    // "dojo/dom-class",
    // "dojo/dom-style",
    // "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    // "dojo/text",
    // "dojo/html",
    // "dojo/_base/event",

    "dojo/query",
    "dojo/dom-attr",
    "dojo/NodeList-traverse"
], function (declare, _WidgetBase, _TemplatedMixin, dojoArray, dojoLang, dojoQuery, dojoAttr) {
    "use strict";


    // Declare widget's prototype.
    return declare("SetAttribute.widget.SetAttribute", [_WidgetBase], {
        // _TemplatedMixin will create our dom node using this HTML template.

        // Parameters configured in the Modeler.
        domQuery: "",
        attributes: "",
        local: false,
        searchParents: false,

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            logger.debug(this.id + ".constructor");
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            logger.debug(this.id + ".postCreate");

            this._updateRendering();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            // Hello World
            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering(callback); // We're passing the callback to updateRendering to be called after DOM-manipulation
        },

        // get the nodes

        getNodes : function(){

            var nodes = null;

            if (this.local) {

                var localNodes = dojoQuery(this.domQuery, this.domNode.parentElement);

                nodes = nodes !== null ? nodes.concat(localNodes) : localNodes;
            }

            if (this.searchParents) {
                var parentNodes = dojoQuery(this.domNode).parents(this.domQuery); 
                nodes = nodes !== null ? nodes.concat(parentNodes) : parentNodes;
            }

            if (this.local !== true && this.searchParents !== true) {

                var allNodes = dojoQuery(this.domQuery);
                nodes = nodes !== null ? nodes.concat(allNodes) : allNodes;

            }

            return nodes;

        },

        // Rerender the interface.
        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");


            var nodes = this.getNodes();

            dojoArray.forEach(nodes, dojoLang.hitch(this, function (node) {

				dojoArray.forEach(this.attributes, dojoLang.hitch(this, function (attribute) {
	                if (this._contextObj && attribute.useDynamicValue && attribute.dynamicValue) {
	                    attribute.value = this._contextObj.get(attribute.dynamicValue);
	                }
	                if (attribute.append === true) {
                        if (dojoAttr.has(node, attribute.attribute)) {
                            var oldValue = dojoAttr.get(node, attribute.attribute).toString(); // added toString in case it's a JS property
                            if (oldValue.indexOf(" " + attribute.value) === -1) {
                                dojoAttr.set(node, attribute.attribute, oldValue + " " + attribute.value);
                            }
                        } else {
							dojoAttr.set(node, attribute.attribute, attribute.value);
                        }
	                } else {
	                    dojoAttr.set(node, attribute.attribute, attribute.value);
                	}
                }));
            }));


            // The callback, coming from update, needs to be executed, to let the page know it finished rendering
			if (callback) {
				callback();
			}
        },

        _unsubscribe: function () {
            if (this._handles) {
                dojoArray.forEach(this._handles, function (handle) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            this._unsubscribe();

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                var objectHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });

                this._handles = [objectHandle];

                // Add subscriptions for configured attributes
                dojoArray.forEach(this.attributes, dojoLang.hitch(this, function (attribute) {
	                if (attribute.useDynamicValue && attribute.dynamicValue) {
                        var attrHandle = mx.data.subscribe({
                            guid: this._contextObj.getGuid(),
                            attr: attribute.dynamicValue,
                            callback: dojoLang.hitch(this, function (guid, attr, attrValue) {
                                this._updateRendering();
                            })
                        });

                        this._handles.push(attrHandle);
                    }
                }));
            }
        }
    });
});

require(["SetAttribute/widget/SetAttribute"]);
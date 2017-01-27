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

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "dojo/query",
    "dojo/dom-attr",
], function(declare, _WidgetBase, _TemplatedMixin,
    dom, dojoDom, dojoProp, dojoGeometry, dojoClass,
    dojoStyle, dojoConstruct, dojoArray, dojoLang,
    dojoText, dojoHtml, dojoEvent,
    dojoQuery, dojoAttr) {
    "use strict";


    // Declare widget's prototype.
    return declare("SetAttribute.widget.SetAttribute", [_WidgetBase], {
        // _TemplatedMixin will create our dom node using this HTML template.

        // Parameters configured in the Modeler.
        domQuery: "",
        attributes: "",
        local: false,

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function() {
            logger.debug(this.id + ".constructor");
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
            logger.debug(this.id + ".postCreate");

            this._updateRendering();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering(callback); // We're passing the callback to updateRendering to be called after DOM-manipulation
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function() {
            logger.debug(this.id + ".enable");
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function() {
            logger.debug(this.id + ".disable");
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function(e) {
            logger.debug(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        // Rerender the interface.
        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");


            var nodes = this.local
              ? this.domNode.parentElement.querySelectorAll(this.domQuery)
              : dojoQuery(this.domQuery);

            dojoArray.forEach(this.attributes, dojoLang.hitch(this, function(attribute) {
                if (this._contextObj && attribute.useDynamicValue && attribute.dynamicValue){
                  attribute.value = this._contextObj.get(attribute.dynamicValue);
                }
                if (attribute.append === true) {
                    dojoArray.forEach(nodes, dojoLang.hitch(this, function(node) {
                        if (dojoAttr.has(node, attribute.attribute)) {
                            var oldValue = dojoAttr.get(node, attribute.attribute).toString(); // added toString in case it's a JS property
                            if (oldValue.indexOf(" " + attribute.value) === -1) {
                                dojoAttr.set(node, attribute.attribute, oldValue + " " + attribute.value);
                            }
                        } else {
                            nodes.attr(attribute.attribute, attribute.value);

                        }

                    }));

                } else {

                    nodes.attr(attribute.attribute, attribute.value);

                }
            }));


            // The callback, coming from update, needs to be executed, to let the page know it finished rendering
            mendix.lang.nullExec(callback);
        },

        _unsubscribe: function() {
            if (this._handles) {
                dojoArray.forEach(this._handles, function(handle) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }
        },

        // Reset subscriptions.
        _resetSubscriptions: function() {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            this._unsubscribe();

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                var objectHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function(guid) {
                        this._updateRendering();
                    })
                });

                this._handles = [objectHandle];
            }
        }
    });
});

require(["SetAttribute/widget/SetAttribute"]);

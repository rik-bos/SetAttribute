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
    "SetAttribute/widget/SetAttribute"
], function (declare, SetAttribute) {
    "use strict";

    // Declare widget's prototype.
    return declare("SetAttribute.widget.SetAttributeTranslatable", [SetAttribute], {});
});

require(["SetAttribute/widget/SetAttributeTranslatable"]);
"use strict";
var Util = require("./Util");
var Step = require("./Step");

module.exports = (function() {

    function StepFormSelector(Site, step) {
        Step.call(this, Site, step);
        if (!step.key) throw "The \"step.key\" property is required";
        if (!step.value) throw "The \"step.value\" property is required";
        if (typeof step.isParameterizable !== "boolean") throw "The \"step.isParameterizable\" property is required";
        if (!step.param) throw "The \"step.param\" property is required";
        this._key = step.key;
        this._value = step.value;
        this._isParameterizable = step.isParameterizable;
        this._param = this._validateParam(step.param);
    }

    StepFormSelector.prototype = Object.create(Step.prototype);
    StepFormSelector.prototype._key = undefined;
    StepFormSelector.prototype._value = undefined;
    StepFormSelector.prototype._isParameterizable = undefined;
    StepFormSelector.prototype._param = undefined;

    StepFormSelector.getDefaults = function(Site) {
        return {
            type: Site.TYPES.FORM_SELECTOR,
            name: "",
            key: "",
            value: "",
            isParameterizable: false,
            param: {
                "name": "",
                "required": false,
                "type": "",
                "default": ""
            }
        };
    };

    StepFormSelector.prototype.getAllParams = function() {
        return [this._param];
    };

    StepFormSelector.prototype.toJson = function(options) {
        return {
            type: this._Site.TYPES.FORM_SELECTOR,
            name: this._name,
            key: this._key,
            value: this._getValue(options),
            isParameterizable: this._isParameterizable,
            param: this._param
        };
    };

    StepFormSelector.prototype.toCasper = function(options) {
        return Util.supplant.call("document.querySelector('{{key}}').value = '{{value}}';", {
            key: this._key,
            value: this._getValue(options)
        });
    };

    StepFormSelector.prototype._validateParam = function(param) {
        if (this._isParameterizable) {
            if (!param.name) {
                throw "Please specify the param name";
            }
            if (param.name.toString().match(/^[-a-zA-Z0-9,&]+$/) == null) {
                throw "Param name must contain only alphanumeric characters";
            }
            //FIXME Once we start actually supporting more kind of params, this IF condition should go away
            if (!param.type) {
                param.type = "string";
            }
        }
        return param;
    };

    StepFormSelector.prototype._getValue = function(options) {
        return this._isParameterizable && options && options.parameterizable ? "<%" + this._param.name + "%>" : this._value;
    };

    return StepFormSelector;

})();

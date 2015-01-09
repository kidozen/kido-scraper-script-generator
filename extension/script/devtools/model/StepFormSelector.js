'use strict';
var Util = require('./Util');
var Step = require('./Step');

module.exports = (function() {

    function StepFormSelector(Site, step) {
        Step.call(this, Site, step);
        if (!step.key) throw 'The "step.key" property is required';
        if (!step.value) throw 'The "step.value" property is required';
        if (typeof step.isParameterizable !== 'boolean') throw 'The "step.isParameterizable" property is required';
        if (!step.param) throw 'The "step.param" property is required';
        this._key = step.key;
        this._value = step.value;
        this._isParameterizable = step.isParameterizable;
        this._param = step.param;
    }

    StepFormSelector.prototype = Object.create(Step.prototype);
    StepFormSelector.prototype._key = undefined;
    StepFormSelector.prototype._value = undefined;
    StepFormSelector.prototype._isParameterizable = undefined;
    StepFormSelector.prototype._param = undefined;

    StepFormSelector.getDefaults = function(Site) {
        return {
            type: Site.TYPES.FORM_SELECTOR,
            name: '',
            key: '',
            value: '',
            isParameterizable: false,
            param: {
                "name": '',
                "required": false,
                "type": '',
                "default": ''
            }
        };
    };

    StepFormSelector.prototype.getAllParams = function() {
        return [this._param];
    };

    StepFormSelector.prototype.toJson = function() {
        return {
            type: this._Site.TYPES.FORM_SELECTOR,
            name: this._name,
            key: this._key,
            value: this._value,
            isParameterizable: this._isParameterizable,
            param: this._param
        };
    };

    StepFormSelector.prototype.toCasper = function() {
        return Util.supplant.call('document.querySelector({{key}}).value = "{{value}}";', {
            key: Util.quote.call(this._key),
            value: this._value
        });
    };

    return StepFormSelector;

})();

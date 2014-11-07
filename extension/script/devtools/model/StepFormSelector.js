'use strict';
var Util = require('./Util');
var Step = require('./Step');

module.exports = (function() {

    function StepFormSelector(Site, step) {
        Step.call(this, Site, step);
        if (!step.key) throw 'The "step.key" property is required';
        if (!step.value) throw 'The "step.value" property is required';
        this._key = step.key;
        this._value = step.value;
    }

    StepFormSelector.prototype = Object.create(Step.prototype);
    StepFormSelector.prototype._key = undefined;
    StepFormSelector.prototype._value = undefined;

    StepFormSelector.getDefaults = function(Site) {
        return {
            type: Site.TYPES.FORM_SELECTOR,
            name: '',
            key: '',
            value: ''
        };
    };

    StepFormSelector.prototype.toJson = function() {
        return {
            type: this._Site.TYPES.FORM_SELECTOR,
            name: this._name,
            key: this._key,
            value: this._value
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

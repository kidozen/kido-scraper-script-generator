var StepFormSelector = (function() {
    'use strict';

    function StepFormSelector(step) {
        if (!step) throw 'The "step" argument is required';
        if (!step.key) throw 'The "step.key" property is required';
        if (!step.value) throw 'The "step.value" property is required';
        Step.call(this, step);
        this._key = step.key;
        this._value = step.value;
    }

    StepFormSelector.prototype = Object.create(Step.prototype);
    StepFormSelector.prototype._key = undefined;
    StepFormSelector.prototype._value = undefined;

    StepFormSelector.getDefaults = function() {
        return {
            type: Site.TYPES.FORM_SELECTOR,
            name: '',
            key: '',
            value: ''
        };
    };

    StepFormSelector.prototype.toJson = function() {
        return {
            type: Site.TYPES.FORM_SELECTOR,
            name: this._name,
            key: this._key,
            value: this._value
        };
    };

    StepFormSelector.prototype.toCasper = function() {
        return 'document.querySelector({{key}}).value = "{{value}}";'.supplant({
            key: this._key.quote(),
            value: this._value
        });
    };

    return StepFormSelector;

})();

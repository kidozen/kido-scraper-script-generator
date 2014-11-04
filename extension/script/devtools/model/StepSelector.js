var StepSelector = (function() {
    'use strict';

    function StepSelector(step) {
        if (!step) throw 'The "step" argument is required';
        if (!step.key) throw 'The "step.key" property is required';
        Step.call(this, step);
        this._key = step.key;
    }

    StepSelector.prototype = Object.create(Step.prototype);
    StepSelector.prototype._key = undefined;

    StepSelector.getDefaults = function() {
        return {
            type: Site.TYPES.SELECTOR,
            name: '',
            key: ''
        };
    };

    StepSelector.prototype.toJson = function() {
        return {
            type: Site.TYPES.SELECTOR,
            name: this._name,
            key: this._key
        };
    };

    StepSelector.prototype.toCasper = function() {
        return 'document.querySelector({{key}}).value;'.supplant({
            key: this._key.quote()
        });
    };

    return StepSelector;

})();

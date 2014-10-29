var StepFormSelector = (function() {
    /* global Site */
    'use strict';

    function StepFormSelector(parent, selector) {
        this._parent = parent;
        this._key = selector.key;
        this._value = selector.value;
    }

    StepFormSelector.prototype._parent = undefined;
    StepFormSelector.prototype._key = undefined;
    StepFormSelector.prototype._value = undefined;

    StepFormSelector.getDefaults = function() {
        return {
            type: Site.TYPES.FORM_SELECTOR,
            key: '',
            value: ''
        };
    };

    StepFormSelector.prototype.toJson = function() {
        return {
            type: Site.TYPES.FORM_SELECTOR,
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

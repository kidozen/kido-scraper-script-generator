var StepFormSelector = (function() {
    'use strict';

    function StepFormSelector(parent, selector) {
        this._parent = parent;
        this._key = selector.key;
        this._value = selector.value;
    }

    StepFormSelector.prototype._parent = undefined;
    StepFormSelector.prototype._key = undefined;
    StepFormSelector.prototype._value = undefined;

    StepFormSelector.prototype.toJson = function() {
        return {
            key: this._key,
            value: this._value
        };
    };

    StepFormSelector.prototype.toCasper = function() {
        return 'document.querySelector("{{key}}").setAttribute("value", "{{value}}");'.supplant({
            key: this._key,
            value: this._value
        });
    };

    return StepFormSelector;

})();

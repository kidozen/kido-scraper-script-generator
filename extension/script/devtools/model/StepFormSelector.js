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
    return JSON.stringify(this);
};

StepFormSelector.prototype.toCasper = function() {
    return '$(' + this._key + ').val(' + this._value + ');';
};

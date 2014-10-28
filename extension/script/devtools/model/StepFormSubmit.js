'use strict';

function StepFormSubmit(parent, submit) {
    this._parent = parent;
    this._key = submit.key;
}

StepFormSubmit.prototype._parent = undefined;
StepFormSubmit.prototype._key = undefined;

StepFormSubmit.prototype.toJson = function() {
    return JSON.stringify(this);
};

StepFormSubmit.prototype.toCasper = function() {
    return '$(' + this._key + ').click();';
};

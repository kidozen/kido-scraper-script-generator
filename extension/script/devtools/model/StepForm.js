/* global StepFormSelector, StepFormSubmit */
'use strict';

var TYPE = 'form';

function StepForm(step) {
    var self = this;
    this._name = step.name;
    this._selectors = step.selectors.map(function(item) {
        return new StepFormSelector(self, item);
    });
    this._submit = new StepFormSubmit(self, step.submit);
}

StepForm.prototype._name = undefined;
StepForm.prototype._selectors = undefined;
StepForm.prototype._submit = undefined;

StepForm.prototype.toJson = function() {
    return {
        type: TYPE,
        name: this._name,
        selectors: this._selectors.map(function(item) {
            return item.toJson();
        })
    };
};

StepForm.prototype.toCasper = function() {
    return 'casper.then();';
};

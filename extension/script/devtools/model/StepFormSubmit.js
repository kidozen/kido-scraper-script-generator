var StepFormSubmit = (function() {
    'use strict';

    function StepFormSubmit(parent, submit) {
        this._parent = parent;
        this._key = submit;
    }

    StepFormSubmit.prototype._parent = undefined;
    StepFormSubmit.prototype._key = undefined;

    StepFormSubmit.prototype.toJson = function() {
        return this._key;
    };

    StepFormSubmit.prototype.toCasper = function() {
        return 'this.click("{{submit}}");'.supplant({
            submit: this._key
        });
    };

    return StepFormSubmit;

})();

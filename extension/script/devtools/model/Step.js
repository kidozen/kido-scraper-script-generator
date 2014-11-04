var Step = (function() {
    'use strict';

    function Step(step) {
        if (!step) throw 'The "step" argument is required';
        if (!step.type) throw 'The "step.type" property is required';
        this._type = step.type;
        this._name = step.name;
    }

    Step.prototype._type = undefined;
    Step.prototype._name = undefined;

    return Step;

})();

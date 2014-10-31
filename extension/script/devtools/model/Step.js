var Step = (function() {
    'use strict';

    function Step(step) {
        this._type = step.type;
        this._name = step.name;
    }

    Step.prototype._type = undefined;
    Step.prototype._name = undefined;

    return Step;

})();

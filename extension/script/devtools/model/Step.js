'use strict';

module.exports = (function() {

    function Step(Site, step) {
        if (!Site) throw 'The "Site" argument is required';
        if (!step) throw 'The "step" argument is required';
        if (!step.type) throw 'The "step.type" property is required';
        if (!Site.TYPES._hasOwnValue(step.type)) throw 'The "step.type" property is not valid';
        this._Site = Site;
        this._type = step.type;
        this._name = step.name;
    }

    Step.prototype._Site = undefined;
    Step.prototype._type = undefined;
    Step.prototype._name = undefined;

    return Step;

})();

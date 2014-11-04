var StepClick = (function() {
    'use strict';

    function StepClick(step) {
        if (!step) throw 'The "step" argument is required';
        if (!step.key) throw 'The "step.key" property is required';
        Step.call(this, step);
        this._key = step.key;
    }

    StepClick.prototype = Object.create(Step.prototype);
    StepClick.prototype._key = undefined;

    StepClick.getDefaults = function() {
        return {
            type: Site.TYPES.CLICK,
            name: '',
            key: ''
        };
    };

    StepClick.prototype.toJson = function() {
        return {
            type: Site.TYPES.CLICK,
            name: this._name,
            key: this._key
        };
    };

    StepClick.prototype.toCasper = function() {
        return multiline(function() {
            /*
                casper.then(function() {
                    this.click({{key}});
                });
            */
        }).supplant({
            key: this._key.quote()
        });
    };

    return StepClick;

})();

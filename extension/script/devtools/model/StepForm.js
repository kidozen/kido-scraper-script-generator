var StepForm = (function() {
    /* global multiline, Site, Step, StepFormSelector, StepClick */
    'use strict';

    function StepForm(step) {
        if (!step) throw 'The "step" argument is required';
        if (!Array.isArray(step.selectors)) throw 'The "step.selectors" property must be an array';
        if (!step.submit) throw 'The "step.submit" property is required';
        Step.call(this, step);
        this._selectors = step.selectors.map(function(item) {
            return new StepFormSelector(item);
        });
        this._submit = new StepClick(step.submit);
    }

    StepForm.prototype = Object.create(Step.prototype);
    StepForm.prototype._selectors = undefined;
    StepForm.prototype._submit = undefined;

    StepForm.getDefaults = function() {
        return {
            type: Site.TYPES.FORM,
            name: '',
            selectors: [Site.getDefaults(Site.TYPES.FORM_SELECTOR)],
            submit: Site.getDefaults(Site.TYPES.CLICK)
        };
    };

    StepForm.prototype.toJson = function() {
        return {
            type: Site.TYPES.FORM,
            name: this._name,
            selectors: this._selectors.map(function(item) {
                return item.toJson();
            }),
            submit: this._submit.toJson()
        };
    };

    StepForm.prototype.toCasper = function() {
        return multiline(function() {
            /*
                casper.thenEvaluate(function() {
                    {{selectors}}
                });
                {{submit}}
            */
        }).supplant({
            selectors: this._selectors.map(function(item) {
                return item.toCasper();
            }).join('\n'),
            submit: this._submit.toCasper()
        });
    };

    return StepForm;

})();

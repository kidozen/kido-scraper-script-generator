var StepForm = (function() {
    /* global multiline, Site, StepFormSelector, StepClick */
    'use strict';

    function StepForm(parent, step) {
        var self = this;
        this._parent = parent;
        this._name = step.name;
        this._selectors = step.selectors.map(function(item) {
            return new StepFormSelector(self, item);
        });
        this._submit = new StepClick(self, step.submit);
    }

    StepForm.prototype._parent = undefined;
    StepForm.prototype._name = undefined;
    StepForm.prototype._selectors = undefined;
    StepForm.prototype._submit = undefined;

    StepForm.getDefaults = function() {
        return {
            type: Site.TYPES.FORM,
            name: '',
            selectors: [{
                key: '',
                value: ''
            }],
            submit: ''
        };
    };

    StepForm.prototype.toJson = function() {
        return {
            type: Site.TYPES.FORM,
            name: this._name,
            selectors: this._selectors.map(function(item) {
                return item.toJson();
            }),
            submit: this._submit.toJson().key
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

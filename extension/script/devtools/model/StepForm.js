'use strict';
var multiline = require('multiline');
var Step = require('./Step');
var StepClick = require('./StepClick');
var StepFormSelector = require('./StepFormSelector');

module.exports = (function() {

    function StepForm(Site, step) {
        Step.call(this, Site, step);
        if (!Array.isArray(step.selectors)) throw 'The "step.selectors" property must be an array';
        if (!step.submit) throw 'The "step.submit" property is required';
        this._selectors = step.selectors.map(function(item) {
            return new StepFormSelector(Site, item);
        });
        this._submit = new StepClick(Site, step.submit);
    }

    StepForm.prototype = Object.create(Step.prototype);
    StepForm.prototype._selectors = undefined;
    StepForm.prototype._submit = undefined;

    StepForm.getDefaults = function(Site) {
        return {
            type: Site.TYPES.FORM,
            name: '',
            selectors: [Site.getDefaults(Site.TYPES.FORM_SELECTOR)],
            submit: Site.getDefaults(Site.TYPES.CLICK)
        };
    };

    StepForm.prototype.toJson = function() {
        return {
            type: this._Site.TYPES.FORM,
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
        })._supplant({
            selectors: this._selectors.map(function(item) {
                return item.toCasper();
            }).join('\n'),
            submit: this._submit.toCasper()
        });
    };

    return StepForm;

})();

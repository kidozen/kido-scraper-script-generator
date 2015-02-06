"use strict";
var multiline = require("multiline");
var Util = require("./Util");
var Step = require("./Step");
var StepClick = require("./StepClick");
var StepFormSelector = require("./StepFormSelector");

module.exports = (function() {

    function StepForm(Site, step) {
        Step.call(this, Site, step);
        if (!Array.isArray(step.selectors)) throw "The \"step.selectors\" property must be an array";
        if (!step.submit) throw "The \"step.submit\" property is required";
        this._selectors = step.selectors.map(function(s) {
            return new StepFormSelector(Site, s);
        });
        this._submit = new StepClick(Site, step.submit);
    }

    StepForm.prototype = Object.create(Step.prototype);
    StepForm.prototype._selectors = undefined;
    StepForm.prototype._submit = undefined;

    StepForm.getDefaults = function(Site) {
        return {
            type: Site.TYPES.FORM,
            name: "",
            selectors: [Site.getDefaults(Site.TYPES.FORM_SELECTOR)],
            submit: Site.getDefaults(Site.TYPES.CLICK)
        };
    };

    StepForm.prototype.getAllParams = function() {
        var allParams = this._selectors.map(function(selector) {
            return selector.getAllParams();
        });
        return [].concat.apply([], allParams);
    };

    StepForm.prototype.toJson = function(options) {
        return {
            type: this._Site.TYPES.FORM,
            name: this._name,
            selectors: this._selectors.map(function(selector) {
                return selector.toJson(options);
            }),
            submit: this._submit.toJson(options)
        };
    };

    StepForm.prototype.toCasper = function(options) {
        return Util.supplant.call(multiline(function() {
            /*
                 casper.thenEvaluate(function() {
                     {{selectors}}
                 });
                 {{submit}}
             */
        }), {
            selectors: this._selectors.map(function(step) {
                return step.toCasper(options);
            }).join("\n"),
            submit: this._submit.toCasper(options)
        });
    };

    return StepForm;

})();

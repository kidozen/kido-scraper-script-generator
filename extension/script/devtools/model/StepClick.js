'use strict';
var multiline = require('multiline');
var Step = require('./Step');

module.exports = (function() {

    function StepClick(Site, step) {
        Step.call(this, Site, step);
        if (!step.key) throw 'The "step.key" property is required';
        this._key = step.key;
    }

    StepClick.prototype = Object.create(Step.prototype);
    StepClick.prototype._key = undefined;

    StepClick.getDefaults = function(Site) {
        return {
            type: Site.TYPES.CLICK,
            name: '',
            key: ''
        };
    };

    StepClick.prototype.toJson = function() {
        return {
            type: this._Site.TYPES.CLICK,
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
        })._supplant({
            key: this._key._quote()
        });
    };

    return StepClick;

})();

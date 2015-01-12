'use strict';
var multiline = require('multiline');
var Util = require('./Util');
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

    StepClick.prototype.getAllParams = function() {
        return [];
    };

    StepClick.prototype.toJson = function(parameterizable) {
        return {
            type: this._Site.TYPES.CLICK,
            name: this._name,
            key: this._key
        };
    };

    StepClick.prototype.toCasper = function(parameterizable) {
        return Util.supplant.call(multiline(function() {
            /*
                 casper.then(function() {
                     this.click({{key}});
                 });
             */
        }), {
            key: Util.quote.call(this._key)
        });
    };

    return StepClick;

})();

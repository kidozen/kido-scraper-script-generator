'use strict';
var multiline = require('multiline');
var Step = require('./Step');

module.exports = (function() {

    function StepSelector(Site, step) {
        Step.call(this, Site, step);
        if (!step.name) throw 'The "step.name" property is required';
        if (!step.key) throw 'The "step.key" property is required';
        if (!step.attr) throw 'The "step.attr" property is required';
        if (!StepSelector.ATTRS.hasOwnValue(step.attr)) throw 'The "step.attr" property is not valid';
        this._key = step.key;
        this._attr = step.attr;
    }

    StepSelector.ATTRS = {
        TEXT: 'innerText'
    };

    StepSelector.prototype = Object.create(Step.prototype);
    StepSelector.prototype._key = undefined;
    StepSelector.prototype._attr = undefined;

    StepSelector.getDefaults = function(Site) {
        return {
            type: Site.TYPES.SELECTOR,
            name: '',
            key: '',
            attr: ''
        };
    };

    StepSelector.prototype.toJson = function() {
        return {
            type: this._Site.TYPES.SELECTOR,
            name: this._name,
            key: this._key,
            attr: this._attr
        };
    };

    StepSelector.prototype.toCasper = function() {
        // TODO: select according to attr
        return multiline(function() {
            /*
                values[{{name}}] = this.evaluate(function() {
                    var selection = document.querySelectorAll({{key}});
                    return [].map.call(selection, function(item) {
                        return item.innerText;
                    });
                });
            */
        }).supplant({
            name: this._name.quote(),
            key: this._key.quote()
        });
    };

    return StepSelector;

})();

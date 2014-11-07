'use strict';
var multiline = require('multiline');
var Step = require('./Step');
var StepSelector = require('./StepSelector');

module.exports = (function() {

    function StepScrap(Site, step) {
        Step.call(this, Site, step);
        if (!step.container) throw 'The "step.container" property is required';
        if (!Array.isArray(step.fields)) throw 'The "step.fields" property must be an array';
        this._container = step.container;
        this._fields = step.fields.map(function(item) {
            return new StepSelector(Site, item);
        });
    }

    StepScrap.prototype = Object.create(Step.prototype);
    StepScrap.prototype._container = undefined;
    StepScrap.prototype._fields = [];

    StepScrap.getDefaults = function(Site) {
        return {
            type: Site.TYPES.SCRAP,
            name: '',
            container: '',
            fields: [Site.getDefaults(Site.TYPES.SELECTOR)]
        };
    };

    StepScrap.prototype.toJson = function() {
        return {
            type: this._Site.TYPES.SCRAP,
            name: this._name,
            container: this._container,
            fields: this._fields.map(function(item) {
                return item.toJson();
            })
        };
    };

    StepScrap.prototype.toCasper = function() {
        return multiline(function() {
            /*
                casper.then(function() {
                    var values = {};
                    {{fields}}
                    var result = [];
                    Object.keys(values).forEach(function(key) {
                        values[key].forEach(function(val, index) {
                            result[index] = result[index] || {};
                            result[index][key] = val;
                        });
                    });
                    this.echo(JSON.stringify(result, null, 2));
                });
            */
        }).supplant({
            container: this._container.quote(),
            fields: this._fields.map(function(item) {
                return item.toCasper();
            }).join('\n')
        });
    };

    return StepScrap;

})();

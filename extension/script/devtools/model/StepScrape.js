'use strict';
var multiline = require('multiline');
var Util = require('./Util');
var Step = require('./Step');
var StepSelector = require('./StepSelector');

module.exports = (function() {

    function StepScrape(Site, step) {
        Step.call(this, Site, step);
        if (!Array.isArray(step.fields)) throw 'The "step.fields" property must be an array';
        this._fields = step.fields.map(function(item) {
            return new StepSelector(Site, item);
        });
    }

    StepScrape.prototype = Object.create(Step.prototype);
    StepScrape.prototype._fields = [];

    StepScrape.getDefaults = function(Site) {
        return {
            type: Site.TYPES.SCRAPE,
            name: 'Scrape',
            fields: [Site.getDefaults(Site.TYPES.SELECTOR)]
        };
    };

    StepScrape.prototype.toJson = function() {
        return {
            type: this._Site.TYPES.SCRAPE,
            name: this._name,
            fields: this._fields.map(function(item) {
                return item.toJson();
            })
        };
    };

    StepScrape.prototype.toCasper = function() {
        return Util.supplant.call(multiline(function() {
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
        }), {
            fields: this._fields.map(function(item) {
                return item.toCasper();
            }).join('\n')
        });
    };

    return StepScrape;

})();

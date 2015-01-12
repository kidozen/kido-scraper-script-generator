'use strict';
var multiline = require('multiline');
var Util = require('./Util');
var Step = require('./Step');
var StepSelector = require('./StepSelector');

module.exports = (function() {

    function StepScrape(Site, step) {
        Step.call(this, Site, step);
        if (!Array.isArray(step.fields)) throw 'The "step.fields" property must be an array';
        this._fields = step.fields.map(function(s) {
            return new StepSelector(Site, s);
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

    StepScrape.prototype.getAllParams = function() {
        return [];
    };

    StepScrape.prototype.toJson = function(parameterizable) {
        return {
            type: this._Site.TYPES.SCRAPE,
            name: this._name,
            fields: this._fields.map(function(step) {
                return step.toJson(parameterizable);
            })
        };
    };

    StepScrape.prototype.toCasper = function(parameterizable) {
        return Util.supplant.call(multiline(function() {
            /*
                 casper.then(function() {
                     {{header}}
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
                     {{footer}}
                 });
             */
        }), {
            header: this._fields.map(function (field) {
                return "casper.waitForSelector('" + field.getKey() + "', function() {";
            }).join('\n'),
            fields: this._fields.map(function (field) {
                return field.toCasper(parameterizable);
            }).join('\n'),
            footer: this._fields.map(function (field) {
                return "});";
            }).join('\n')
        });
    };
    return StepScrape;

})();

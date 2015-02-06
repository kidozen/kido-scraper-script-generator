"use strict";
var multiline = require("multiline");
var Util = require("./Util");
var Step = require("./Step");
var StepSelector = require("./StepSelector");

module.exports = (function() {

    function StepScrape(Site, step) {
        Step.call(this, Site, step);
        if (!Array.isArray(step.fields)) throw "The \"step.fields\" property must be an array";
        this._fields = step.fields.map(function(s) {
            return new StepSelector(Site, s);
        });
        this._container = step.container;
    }

    StepScrape.prototype = Object.create(Step.prototype);
    StepScrape.prototype._fields = [];
    StepScrape.prototype._container = "";

    StepScrape.getDefaults = function(Site) {
        return {
            type: Site.TYPES.SCRAPE,
            name: "Scrape",
            fields: [Site.getDefaults(Site.TYPES.SELECTOR)],
            container: ""
        };
    };

    StepScrape.prototype.getAllParams = function() {
        return [];
    };

    StepScrape.prototype.toJson = function(options) {
        return {
            type: this._Site.TYPES.SCRAPE,
            name: this._name,
            fields: this._fields.map(function(step) {
                return step.toJson(options);
            }),
            container: this._container
        };
    };

    StepScrape.prototype.toCasper = function(options) {
        var code;
        if (this._container) {
            options = options || {};
            options["scrapeWithinContainer"] = true;

            code = this._casperCodeForScrapingWithinContainer();
        } else {
            code = this._casperCodeForScrapingFromDocument();
        }
        return Util.supplant.call(multiline(code), {
                header: this._fields.map(function (field) {
                    return "casper.waitForSelector('" + field.getKey() + "', function() {";
                }).join("\n"),
                container: this._container,
                fields: this._fields.map(function (field) {
                    return field.toCasper(options);
                }).join("\n"),
                footer: this._fields.map(function () {
                    return "});";
                }).join("\n")
            });
    };

    StepScrape.prototype._casperCodeForScrapingWithinContainer = function () {
        return function() {
            /*
                casper.then(function() {
                    {{header}}
                    var result = this.evaluate(function() {
                        var containers = Array.prototype.slice.call(document.querySelectorAll('{{container}}'));

                        return [].map.call(containers, function(container) {
                            var element;
                            var currentItemScrapedValues = {};

                            {{fields}}

                            return currentItemScrapedValues;
                        });
                    });
                    this.echo(JSON.stringify(result, null, 2));
                    {{footer}}
                });
             */
        };
    };

    StepScrape.prototype._casperCodeForScrapingFromDocument = function () {
        return function() {
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
        };
    };

    return StepScrape;

})();

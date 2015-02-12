"use strict";
var multiline = require("multiline");
var Util = require("./Util");
var Step = require("./Step");

module.exports = (function () {

    function StepSelector(Site, step) {
        Step.call(this, Site, step);
        if (!step.name) throw "The \"step.name\" property is required";
        if (!step.key) throw "The \"step.key\" property is required";
        if (!step.attr) throw "The \"step.attr\" property is required";
        if (!Util.hasOwnValue.call(StepSelector.ATTRS, step.attr)) throw "The \"step.attr\" property is not valid";
        this._key = step.key;
        this._attr = step.attr;
    }

    StepSelector.ATTRS = {
        TEXT: "innerText"
    };

    StepSelector.prototype = Object.create(Step.prototype);
    StepSelector.prototype._key = undefined;
    StepSelector.prototype._attr = StepSelector.ATTRS.TEXT;

    StepSelector.getDefaults = function (Site) {
        return {
            type: Site.TYPES.SELECTOR,
            name: "",
            key: "",
            attr: StepSelector.ATTRS.TEXT
        };
    };

    StepSelector.prototype.getKey = function () {
        return this._key;
    };

    StepSelector.prototype.getAllParams = function () {
        return [];
    };

    StepSelector.prototype.toJson = function (options) {
        return {
            type: this._Site.TYPES.SELECTOR,
            name: this._name,
            key: this._key,
            attr: this._attr
        };
    };

    StepSelector.prototype.toCasper = function (options) {
        // TODO: select according to this._attr instead of hard-coding "innerText"
        var code;
        if (options && options.scrapeWithinContainer) {
            code = function () {
                /*
                    element = container.querySelector('{{key}}');
                    currentItemScrapedValues['{{name}}'] = element ? element.innerText : null;
                 */
            };
        } else {
            code = function () {
                /*
                    values['{{name}}'] = this.evaluate(function() {
                        var selection = document.querySelectorAll('{{key}}');
                        return [].map.call(selection, function(item) {
                            return item.innerText;
                        });
                    });
                */
            };
        }

        return Util.supplant.call(multiline(code), {
            name: this._name,
            key: this._key
        });
    };

    StepSelector.prototype.getHelperFunctions = function() {
        return undefined;
    };

    return StepSelector;

})();

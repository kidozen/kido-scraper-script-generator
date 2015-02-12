"use strict";
var multiline = require("multiline");
var Util = require("./Util");
var Step = require("./Step");

module.exports = (function() {

    function StepSelect(Site, step) {
        Step.call(this, Site, step);
        if (!step.key) throw "The \"step.key\" property is required";
        if (!step.label) throw "The \"step.label\" property is required";
        this._key = step.key;
        this._label = step.label;
    }

    StepSelect.prototype = Object.create(Step.prototype);
    StepSelect.prototype._key = undefined;
    StepSelect.prototype._label = undefined;

    StepSelect.getDefaults = function(Site) {
        return {
            type: Site.TYPES.SELECT,
            name: "",
            key: "",
            label: ""
        };
    };

    StepSelect.prototype.getAllParams = function() {
        return [];
    };

    StepSelect.prototype.toJson = function(options) {
        return {
            type: this._Site.TYPES.SELECT,
            name: this._name,
            key: this._key,
            label: this._label
        };
    };

    StepSelect.prototype.toCasper = function(options) {
        return Util.supplant.call(multiline(function() {
            /*
                casper.then(function() {
                    this.selectOptionByText('{{key}}', '{{label}}');
                });
             */
        }), {
            key: this._key,
            label: this._label
        });
    };

    StepSelect.prototype.getHelperFunctions = function() {
        return multiline(function() {
            /*
                casper.selectOptionByText = function(selector, label) {
                    this.waitForSelector(selector, function() {
                        this.evaluate(function(selector, label){
                            var options = document.querySelectorAll(selector + ' > option');

                            var evt = document.createEvent("HTMLEvents");
                            evt.initEvent("change", false, true);

                            for (i = 0; i < options.length; i++) {
                                var current = options[i];

                                if (current.textContent.indexOf(label) !== -1){
                                    current.setAttribute('selected', 'selected');
                                    current.parentNode.selectedIndex = i;
                                    current.parentNode.dispatchEvent(evt);
                                } else if (current.selected) {
                                    current.removeAttribute('selected');
                                }
                            }
                        }, selector, label);
                    });
                };
             */
        });
    };

    return StepSelect;

})();

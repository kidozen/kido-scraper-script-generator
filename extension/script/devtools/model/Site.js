'use strict';
var multiline = require('multiline');
var Util = require('./Util');
var StepClick = require('./StepClick');
var StepForm = require('./StepForm');
var StepFormSelector = require('./StepFormSelector');
var StepScrape = require('./StepScrape');
var StepSelector = require('./StepSelector');
var beautify = require('js-beautify').js_beautify;

module.exports = (function() {

    function Site(site) {
        if (!site) throw 'The "site" argument is required';
        if (!site.name) throw 'The "site.name" property is required';
        if (!site.url) throw 'The "site.url" property is required';
        if (!Array.isArray(site.steps)) throw 'The "site.steps" property must be an array';
        this._name = site.name;
        this._url = site.url;
        this._steps = site.steps.map(function(item) {
            switch (item.type) {
                case Site.TYPES.CLICK:
                    return new StepClick(Site, item);
                case Site.TYPES.FORM:
                    return new StepForm(Site, item);
                case Site.TYPES.FORM_SELECTOR:
                    return new StepFormSelector(Site, item);
                case Site.TYPES.SCRAPE:
                    return new StepScrape(Site, item);
                case Site.TYPES.SELECTOR:
                    return new StepSelector(Site, item);
            }
        });
    }

    Site.TYPES = {
        CLICK: 'click',
        FORM: 'form',
        FORM_SELECTOR: 'form_selector',
        SCRAPE: 'scrape',
        SELECTOR: 'selector'
    };

    Site.getConstructor = function(type) {
        switch (type) {
            case Site.TYPES.CLICK:
                return StepClick;
            case Site.TYPES.FORM:
                return StepForm;
            case Site.TYPES.FORM_SELECTOR:
                return StepFormSelector;
            case Site.TYPES.SCRAPE:
                return StepScrape;
            case Site.TYPES.SELECTOR:
                return StepSelector;
            case undefined:
                return Site;
            default:
                throw 'The type is not valid';
        }
    };

    Site.getDefaults = function(type) {
        if (type !== undefined) {
            return Site.getConstructor(type).getDefaults(Site);
        }
        return {
            name: '',
            url: '',
            steps: []
        };
    };

    Site.validateStep = function(step) {
        if (!step) throw 'The "step" argument is required';
        if (!step.type) throw 'The "step.type" property is required';
        var Constructor = Site.getConstructor(step.type);
        try {
            step = new Constructor(Site, step);
        } catch (exception) {
            throw exception.toString();
        }
        return true;
    };

    Site.prototype._name = undefined;
    Site.prototype._url = undefined;
    Site.prototype._steps = [];

    Site.prototype.getAllParams = function() {
        var allParams = this._steps.map(function(step) {
            return step.getAllParams();
        });
        return [].concat.apply([], allParams);
    };

    Site.prototype.toJson = function() {
        return {
            name: this._name,
            url: this._url,
            steps: this._steps.map(function(item) {
                return item.toJson();
            })
        };
    };

    Site.prototype.toCasper = function() {
        return beautify(Util.supplant.call(multiline(function() {
            /*
                 var casper = require('casper').create({
                     pageSettings: {
                         loadImages: false,
                         loadPlugins: false
                     }
                 });
                 casper.start('{{url}}');
                 {{steps}}
                 casper.run(function() {
                     this.exit();
                 });
             */
        }), {
            url: this._url,
            steps: this._steps.map(function(item) {
                return item.toCasper();
            }).join('\n')
        }), { indent_size: 4 });
    };

    return Site;

})();

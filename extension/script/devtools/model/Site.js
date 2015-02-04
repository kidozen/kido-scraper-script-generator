'use strict';
var multiline = require('multiline');
var Util = require('./Util');
var StepClick = require('./StepClick');
var StepForm = require('./StepForm');
var StepFormSelector = require('./StepFormSelector');
var StepScrape = require('./StepScrape');
var StepSelector = require('./StepSelector');
var beautify = require('js-beautify').js_beautify;
var _ = require('lodash');

module.exports = (function() {

    function Site(site) {
        if (!site) throw 'The "site" argument is required';
        if (!site.name) throw 'The "site.name" property is required';
        if (!site.url) throw 'The "site.url" property is required';
        if (!_.isEmpty(site.credentials)) {
            if ((site.credentials.user && !site.credentials.pass) ||
                (!site.credentials.user && site.credentials.pass)) {
                throw 'Both the username and password are required';
            }
        }
        if (!Array.isArray(site.steps)) throw 'The "site.steps" property must be an array';
        this._name = site.name;
        this._url = site.url;
        this._credentials = site.credentials;
        this._steps = site.steps.map(function(step) {
            switch (step.type) {
                case Site.TYPES.CLICK:
                    return new StepClick(Site, step);
                case Site.TYPES.FORM:
                    return new StepForm(Site, step);
                case Site.TYPES.FORM_SELECTOR:
                    return new StepFormSelector(Site, step);
                case Site.TYPES.SCRAPE:
                    return new StepScrape(Site, step);
                case Site.TYPES.SELECTOR:
                    return new StepSelector(Site, step);
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
            credentials:{},
            steps: []
        };
    };

    Site.validateStep = function(step, site, forCreation) {
        if (!step) throw 'The "step" argument is required';
        if (!step.name) throw 'The "step.name" property is required';
        if (!step.type) throw 'The "step.type" property is required';

        if (forCreation) {
            var existingStepWithSameName = _.find(site.steps, function (s) {
                return s.name === step.name;
            });
            if (existingStepWithSameName) throw 'Duplicated step name: ' + step.name;
        }
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
    Site.prototype._credentials = undefined;
    Site.prototype._steps = [];

    Site.prototype.getAllParams = function() {
        var allParams = this._steps.map(function(step) {
            return step.getAllParams();
        });
        return [].concat.apply([], allParams);
    };

    Site.prototype.toJson = function(options) {
        return {
            name: this._name,
            url: this._url,
            credentials: this._credentials,
            steps: this._steps.map(function(step) {
                return step.toJson(options);
            })
        };
    };

    Site.prototype.toCasper = function(options) {
        return beautify(Util.supplant.call(multiline(function() {
/*
     var casper = require('casper').create({
         pageSettings: {
             loadImages: false,
             loadPlugins: false
         }
     });
     casper.start();
     {{credentials}}
     casper.thenOpen('{{url}}');
     {{steps}}
     casper.run(function() {
         this.exit();
     });
 */
        }), {
            credentials: this._getHttpBasicCredentialsScript(),
            url: this._url,
            steps: this._steps.map(function(step) {
                return step.toCasper(options);
            }).join('\n')
        }), { indent_size: 4 });
    };

    Site.prototype._getHttpBasicCredentialsScript = function() {
        if (!_.isEmpty(this._credentials)) {
            return "casper.setHttpAuth('" + escapeSingleQuotes(this._credentials.user) + "', '" + escapeSingleQuotes(this._credentials.pass) + "');";
        }
        return "";
    };

    function escapeSingleQuotes(string) {
        return string.replace(/'/g, "\\'");
    }

    return Site;

})();

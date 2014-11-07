'use strict';
var multiline = require('multiline');
var Util = require('./Util');
var StepClick = require('./StepClick');
var StepForm = require('./StepForm');
var StepFormSelector = require('./StepFormSelector');
var StepScrap = require('./StepScrap');
var StepSelector = require('./StepSelector');

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
                case Site.TYPES.SCRAP:
                    return new StepScrap(Site, item);
                case Site.TYPES.SELECTOR:
                    return new StepSelector(Site, item);
            }
        });
    }

    Site.TYPES = {
        CLICK: 'click',
        FORM: 'form',
        FORM_SELECTOR: 'form_selector',
        SCRAP: 'scrap',
        SELECTOR: 'selector'
    };

    Site.getDefaults = function(type) {
        switch (type) {
            case Site.TYPES.CLICK:
                return StepClick.getDefaults(Site);
            case Site.TYPES.FORM:
                return StepForm.getDefaults(Site);
            case Site.TYPES.FORM_SELECTOR:
                return StepFormSelector.getDefaults(Site);
            case Site.TYPES.SCRAP:
                return StepScrap.getDefaults(Site);
            case Site.TYPES.SELECTOR:
                return StepSelector.getDefaults(Site);
            case undefined:
                return {
                    name: '',
                    url: '',
                    steps: []
                };
            default:
                throw 'The type is not valid';
        }
    };

    Site.prototype._name = undefined;
    Site.prototype._url = undefined;
    Site.prototype._steps = [];

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
        return Util.supplant.call(multiline(function() {
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
        });
    };

    return Site;

})();

var Site = (function() {
    /* global multiline, StepForm, StepFormSelector, StepClick, StepScrap */
    'use strict';

    function Site(site) {
        var self = this;
        this._name = site.name;
        this._url = site.url;
        this._steps = site.steps.map(function(item) {
            switch (item.type) {
                case Site.TYPES.FORM:
                    return new StepForm(self, item);
                case Site.TYPES.FORM_SELECTOR:
                    return new StepFormSelector(self, item);
                case Site.TYPES.CLICK:
                    return new StepClick(self, item);
                case Site.TYPES.SCRAP:
                    return new StepScrap(self, item);
            }
        });
    }

    Site.TYPES = {
        FORM: 'form',
        FORM_SELECTOR: 'form_selector',
        CLICK: 'click',
        SCRAP: 'scrap'
    };

    Site.getDefaults = function(type) {
        switch (type) {
            case Site.TYPES.FORM:
                return StepForm.getDefaults();
            case Site.TYPES.FORM_SELECTOR:
                return StepFormSelector.getDefaults();
            case Site.TYPES.CLICK:
                return StepClick.getDefaults();
            case Site.TYPES.SCRAP:
                return StepScrap.getDefaults();
            default:
                return {
                    name: '',
                    url: '',
                    steps: []
                };
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
        var result = multiline(function() {
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
        }).supplant({
            url: this._url,
            steps: this._steps.map(function(item) {
                return item.toCasper();
            }).join('\n')
        });
        return result;
    };

    return Site;

})();

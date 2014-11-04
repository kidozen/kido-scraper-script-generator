var Site = (function() {
    'use strict';

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
                    return new StepClick(item);
                case Site.TYPES.FORM:
                    return new StepForm(item);
                case Site.TYPES.FORM_SELECTOR:
                    return new StepFormSelector(item);
                case Site.TYPES.SCRAP:
                    return new StepScrap(item);
                case Site.TYPES.SELECTOR:
                    return new StepSelector(item);
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
                return StepClick.getDefaults();
            case Site.TYPES.FORM:
                return StepForm.getDefaults();
            case Site.TYPES.FORM_SELECTOR:
                return StepFormSelector.getDefaults();
            case Site.TYPES.SCRAP:
                return StepScrap.getDefaults();
            case Site.TYPES.SELECTOR:
                return StepSelector.getDefaults();
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

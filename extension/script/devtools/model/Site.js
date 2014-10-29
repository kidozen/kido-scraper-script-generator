var Site = (function() {
    /* global multiline, StepForm */
    'use strict';

    var TYPES = {
        FORM: 'form',
        CLICK: 'click',
        SCRAP: 'scrap'
    };

    function Site(site) {
        var self = this;
        this._name = site.name;
        this._url = site.url;
        this._steps = site.steps.map(function(item) {
            switch (item.type) {
                case TYPES.FORM:
                    return new StepForm(self, item);
                case TYPES.CLICK:
                    return null;
                case TYPES.SCRAP:
                    return null;
            }
        });
    }

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

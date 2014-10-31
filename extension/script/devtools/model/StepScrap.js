var StepScrap = (function() {
    /* global multiline, Site, Step */
    'use strict';

    function StepScrap(step) {
        Step.call(this, step);
        this._container = step.container;
        this._fields = step.fields;
    }

    StepScrap.prototype = Object.create(Step.prototype);
    StepScrap.prototype._container = undefined;
    StepScrap.prototype._fields = [];

    StepScrap.getDefaults = function() {
        return {
            type: Site.TYPES.SCRAP,
            name: '',
            key: ''
        };
    };

    StepScrap.prototype.toJson = function() {
        return {
            type: Site.TYPES.SCRAP,
            name: this._name,
            key: this._container
        };
    };

    StepScrap.prototype.toCasper = function() {
        return multiline(function() {
            /*
                casper.then(function() {
                    this.click({{key}});
                });
            */
        }).supplant({
            key: this._container.quote()
        });
    };

    return StepScrap;

})();

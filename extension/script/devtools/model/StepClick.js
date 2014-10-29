var StepClick = (function() {
    /* global multiline, Site */
    'use strict';

    function StepClick(parent, key) {
        this._parent = parent;
        this._key = key;
    }

    StepClick.prototype._parent = undefined;
    StepClick.prototype._key = undefined;

    StepClick.getDefaults = function() {
        return {
            type: Site.TYPES.CLICK,
            key: ''
        };
    };

    StepClick.prototype.toJson = function() {
        return {
            type: Site.TYPES.CLICK,
            key: this._key
        };
    };

    StepClick.prototype.toCasper = function() {
        return multiline(function() {
            /*
                casper.then(function() {
                    this.click({{key}});
                });
            */
        }).supplant({
            key: this._key.quote()
        });
    };

    return StepClick;

})();

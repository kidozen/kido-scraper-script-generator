var StepScrap = (function() {
    'use strict';

    function StepScrap(step) {
        if (!step) throw 'The "step" argument is required';
        if (!step.container) throw 'The "step.container" property is required';
        if (!Array.isArray(step.fields)) throw 'The "step.fields" property must be an array';
        Step.call(this, step);
        this._container = step.container;
        this._fields = step.fields.map(function(item) {
            return new StepSelector(item);
        });
    }

    StepScrap.prototype = Object.create(Step.prototype);
    StepScrap.prototype._container = undefined;
    StepScrap.prototype._fields = [];

    StepScrap.getDefaults = function() {
        return {
            type: Site.TYPES.SCRAP,
            name: '',
            container: '',
            fields: [Site.getDefaults(Site.TYPES.SELECTOR)]
        };
    };

    StepScrap.prototype.toJson = function() {
        return {
            type: Site.TYPES.SCRAP,
            name: this._name,
            container: this._container,
            fields: this._fields.map(function(item) {
                return item.toJson();
            })
        };
    };

    StepScrap.prototype.toCasper = function() {
        return multiline(function() {
            /*
                casper.then(function() {
                    var values = {};
                    {{fields}}
                    this.echo(JSON.stringify(values, null, 2));
                });
            */
        }).supplant({
            container: this._container.quote(),
            fields: this._fields.map(function(item) {
                return item.toCasper();
            }).join('\n')
        });
    };

    return StepScrap;

})();

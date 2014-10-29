String.prototype.supplant = function(o) {
    'use strict';
    return this.replace(/{{([^{}]*)}}/g,
        function(a, b) {
            var r = o[b];
            if (!r) return b;
            return typeof r === 'string' || typeof r === 'number' ? r : r.toString();
        }
    );
};

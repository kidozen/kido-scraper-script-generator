if (!Object.prototype.hasOwnValue) {
    Object.prototype.hasOwnValue = function(val) {
        'use strict';
        for (var prop in this) {
            if (this.hasOwnProperty(prop) && this[prop] === val) {
                return true;
            }
        }
        return false;
    };
}

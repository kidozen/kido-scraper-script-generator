function InMemoryStorage() {
    this.storage = {};
};

/**
 * Loads a single value from an in-memory (i.e. volatile) object
 * @param key
 * @param cb Callback with storage items. It should be a function that looks like this: function(object item) {...};
 */
InMemoryStorage.prototype.get = function(cb, key) {
    if (key) {
        cb(this.storage[key] ? this.storage[key].toJson() : undefined);
    } else {
        var self = this;
        console.log("invoking getAll()...");
        var allValues = Object.keys(this.storage).map(function (item) {
            //console.log("inside the callback of keys.map()");
            return self.storage[item].toJson();
        });
        //console.log('about to return ' + JSON.stringify(allValues, null, 2));
        cb(allValues ? allValues : []);
    }
};

/**
 * Saves configuration to an in-memory (i.e. volatile) object
 * @param key (mandatory)
 * @param object (mandatory)
 * @param cb (optional) If specified, it should be a function that looks like this:function() {...};
 */
InMemoryStorage.prototype.store = function (key, object, cb) {
    this.storage[key] = object;
    if (cb) {
        cb();
    }
};

module.exports = InMemoryStorage;
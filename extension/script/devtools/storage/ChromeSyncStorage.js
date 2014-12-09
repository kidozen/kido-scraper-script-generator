function ChromeSyncStorage() {
};

/**
 * Loads a single value from chrome extension sync storage
 * @param key
 * @param cb Callback with a storage item. It should be a function that looks like this: function(object item) {...};
 */
ChromeSyncStorage.prototype.get = function (cb, key) {
    if (key) {
        chrome.storage.sync.get(key, function (item) {
            alert("item: " + item);
            cb(item ? item.toJson() : undefined);
        });
    } else {
        chrome.storage.sync.get(null, function (items) {
            alert("GetAll: " + items);
            var allValues = Object.keys(items).map(function (item) {
                return item.toJson();
            });
            cb(allValues ? allValues : []);
        });
        alert("OK. I have invoked...");
    }
};

/**
 * Saves a key/value pair to chrome extension sync storage
 * @param key (mandatory)
 * @param object (mandatory)
 * @param cb (optional) If specified, it should be a function that looks like this:function() {...};
 */
ChromeSyncStorage.prototype.store = function (key, object, cb) {
    var toBeStored = {};
    toBeStored[key] = object;
    alert("About to store " + JSON.stringify(toBeStored, null, 2));

    if (cb) {
        chrome.storage.sync.set(toBeStored, cb);
    } else {
        chrome.storage.sync.set(toBeStored);
    }
};

module.exports = ChromeSyncStorage;
/**
 * ContentScript that can be called from anywhere within the extension
 */
var BackgroundScript = {
    /**
     * Returns the id of the tab that is visible to user
     * @returns $.Deferred() integer
     */
    getActiveTabId: function () {

        var deferredResponse = $.Deferred();

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {

            if (tabs.length < 1) {
                // @TODO must be running within popup. maybe find another active window?
                deferredResponse.reject("couldn't find the active tab");
            } else {
                var tabId = tabs[0].id;
                deferredResponse.resolve(tabId);
            }
        });
        return deferredResponse.promise();
    },

    /**
     * Execute a function within the active tab within content script
     * @param request.fn    function to call
     * @param request.request    request that will be passed to the function
     */
    executeContentScript: function (request) {
        alert("Executing request on the active tab: " + JSON.stringify(request, null, 2));

        alert("[Background Script#executeContentScript()] Context is: " + JSON.stringify(this, null, 2));
        var reqToContentScript = {
            contentScriptCall: true,
            fn: request.fn,
            request: request.request
        };
        var deferredResponse = $.Deferred();
        var deferredActiveTabId = this.getActiveTabId();
        deferredActiveTabId.done(function (tabId) {
            chrome.tabs.sendMessage(tabId, reqToContentScript, function (response) {
                deferredResponse.resolve(response);
            });
        });

        return deferredResponse;
    }
};

/**
 * @param location    configure from where the content script is being accessed (ContentScript, BackgroundPage, DevTools)
 * @returns BackgroundScript
 */
var getBackgroundScript = function (location) {

    // Handle calls from different places
    if (location === "BackgroundScript") {
        return BackgroundScript;
    }
    else if (location === "DevTools" || location === "ContentScript") {
        // if called within background script proxy calls to content script
        return wrapAllFunctionsOf(BackgroundScript, "backgroundScriptCall");
    } else {
        throw "Invalid BackgroundScript initialization - " + location;
    }
};

var wrapAllFunctionsOf = function(anObject, sourceFlag) {
    var backgroundScript = {};

    Object.keys(anObject).forEach(function (attr) {
        if (typeof anObject[attr] === 'function') {
            backgroundScript[attr] = proxyInvocationOf(attr, sourceFlag);
        } else {
            backgroundScript[attr] = anObject[attr];
        }
    });
    return backgroundScript;
};

var proxyInvocationOf = function (aFunction, sourceFlag) {
    // if called within background script proxy calls to content script
    return function (request) {
        alert("[[[[" + sourceFlag + "]]]] invoking proxied version of " + aFunction);
        var reqToBackgroundScript = {
            fn: aFunction,
            request: request
        };
        reqToBackgroundScript[sourceFlag] = true;

        var deferredResponse = $.Deferred();

        alert("Is chrome.runtime available? " + (chrome && chrome.runtime));

        chrome.runtime.sendMessage(reqToBackgroundScript, function (response) {
            if (runtime.lastError) {
                alert("There was an error while sending the message to the background script!!!");
            } else {
                alert("This is the response: " + JSON.stringify(response));
                deferredResponse.resolve(response);
            }
        });
        return deferredResponse;
    };
};
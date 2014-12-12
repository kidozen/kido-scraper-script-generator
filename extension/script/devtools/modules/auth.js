'use strict';
// This module can be loaded both from the background page or from the extension itself. The former does not use Common JS.
if (typeof require === 'function') {
    require('angular');
}

var bootstrapAuthModule = function () {

    angular.module('auth', ['kidoStorage']).factory('auth', function (kidoStorage, RuntimeEnvironment) {

        console.log("Creating auth...");

        var prefix = 'Success payload=';
        var auth_key_in_storage = 'token';

        var self = {
            getAuthToken: function () {
                var deferredResponse = $.Deferred();

                kidoStorage.get(auth_key_in_storage).then(function (token) {
                    if (token && token[auth_key_in_storage]) {
                        deferredResponse.resolve(token);
                    } else {
                        if (RuntimeEnvironment.runningAsAnExtension()) {
                            proxyInvocationOf(function () {
                                // TODO Take this URL from a service rather than hardcoding it!
                                chrome.tabs.create(
                                    {url: "https://auth-qa.kidozen.com/v1/armonia/sign-in?wtrealm=_marketplace&wreply=urn-ietf-wg-oauth-2.0-oob&wa=wsignin1.0"},
                                    function (t) {
                                        var authTokenGrabber = function (tabId, changeInfo, tab) {
                                            if (tabId === t.id) {
                                                if ((tab && tab.title || '').indexOf(prefix) === 0) {
                                                    var token = tab.title.substr(prefix.length);
                                                    deferredResponse.resolve(token);
                                                    kidoStorage.set(auth_key_in_storage, token);
                                                    chrome.tabs.onUpdated.removeListener(authTokenGrabber);
                                                    chrome.tabs.remove(tab.id);
                                                }
                                            }
                                        };
                                        chrome.tabs.onUpdated.addListener(authTokenGrabber);
                                    }
                                );
                            }, "authCall")();
                        } else {
                            var token;
                            while (!token) {
                                token = window.prompt("Enter your Auth token");
                            }
                            deferredResponse.resolve(token);
                            kidoStorage.set(auth_key_in_storage, token);
                        }
                    }
                });
                return deferredResponse.promise();
            }
        }

        return self;
    })
};

var authModule = bootstrapAuthModule();

if (typeof module === 'object') {
    module.exports = authModule;
}
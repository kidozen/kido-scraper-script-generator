var prefix = 'Success payload=';
var auth_key_in_storage = 'token_';
var auth_service_url_in_storage = 'auth_service_url_';
var NOT_LOGGED_IN_MESSAGE = "You are not logged in to any marketplace yet.\nPlease do so by opening the extension's popup dialog (next to the address bar) and try again.";
var AUTH_COOKIE_NAME = 'connect.sid';

// TODO This does not work when running as a web application, refactor!
var haveAccessToChromeStorageAPI = function() { return chrome && chrome.storage; };

String.prototype.startsWith = function (suffix) {
	return this.substr(0, suffix.length) === suffix;
};

var collection = {};
var inMemoryDb = {};

inMemoryDb.store = function (key, value) {
	collection[key] = value;
};

inMemoryDb.remove = function (key) {
	delete collection[key];
};

inMemoryDb.get = function (key) {
	if (key) {
		return collection[key] ? collection[key] : undefined;
	}
	var allValues = Object.keys(collection).map(function (item) {
		return item === 'token' ? null: collection[item];
	});
	allValues = allValues ? allValues.filter(function (val) {
		return val !== null;
	}) : [];
	return allValues;
};

/**
 * ContentScript that can be called from anywhere within the extension
 */
var BackgroundScript = {

	lastUsedMarketplaceURL: 'last_used_marketplace_url',

	decodeToken: function (token) {
		var decodedToken = $.base64.decode(token);

		var parsedToken = decodedToken.split(",")[1].substr('{"access_token":"'.length - 1);

		parsedToken = parsedToken.substr(0, parsedToken.length - 1); // remove trailing "

		// TODO Re-instate this code when we solve the problem of the tab title being truncated by Google Chrome
		//var parsedToken = JSON.parse(decodedToken).access_token;

		return parsedToken;
	},

	getAuthServiceUrlFor: function (marketplaceURL) {
		var deferredResponse = $.Deferred();
		var self = this;

		self.getFromLocalStorage(auth_service_url_in_storage + marketplaceURL).done(function (authServiceUrl) {
			if (authServiceUrl) {
				deferredResponse.resolve(authServiceUrl);
			} else {
				try {
					$.ajax({
						type: "GET",
						url: marketplaceURL + "publicapi/auth/config"
					}).done(function (data) {
						deferredResponse.resolve(data.signInUrl);
					}).fail(function (jqXHR) {
						deferredResponse.reject("Unable to retrieve the URL of the Auth Service. Please contact the administrator.");
					});
				} catch (error) {
					self.fetchANewTokenFor(marketplaceURL).done(function (newToken) { deferredResponse.resolve(newToken); });
				}
			}
		});
		return deferredResponse.promise();
	},

    getAuthTokenKeyInLocalStorageFor: function (marketplaceURL) {
        var deferredResponse = $.Deferred();
        deferredResponse.resolve(auth_key_in_storage + marketplaceURL);
        return deferredResponse.promise();
    },

	fetchANewTokenFor: function (marketplaceURL) {
		var deferredResponse = $.Deferred();
		var self = this;

		self.getAuthServiceUrlFor(marketplaceURL).done(function(authServiceUrl) {
			chrome.tabs.create(
				{url: authServiceUrl},
				function (t) {
					var authTokenGrabber = function (tabId, changeInfo, tab) {
						if (tabId === t.id) {
							if ((tab && tab.title || '').indexOf(prefix) === 0) {

								var token = tab.title.substr(prefix.length);

								try {
									var accessToken = self.decodeToken(token);

									var saveRequest = {};
									saveRequest["key"] = auth_key_in_storage + marketplaceURL;
									saveRequest["value"] = accessToken;

									self.setInLocalStorage(saveRequest);
									chrome.tabs.onUpdated.removeListener(authTokenGrabber);
									chrome.tabs.remove(tab.id);

									deferredResponse.resolve(accessToken);
								} catch (err) {
									var errorMsg = "Problem while attempting to retrieve auth token: " + err;
									deferredResponse.reject(errorMsg);

									// This is a HACK: for some reason a weird error is thrown when invoking this
									// function from the extension's popup, we can safely ignore it...
									if (err && err.message && err.message.indexOf("Attempting to use a disconnected port object") == -1) {
										alert(errorMsg);
									}
								}
							}
						}
					};
					chrome.tabs.onUpdated.addListener(authTokenGrabber);
				}
			);
		});
		return deferredResponse.promise();
	},

    getAuthCookie: function (marketplaceURL) {
        var deferredResponse = $.Deferred();
        var self = this;

        if (marketplaceURL) {
            chrome.cookies.get({url: marketplaceURL, name: AUTH_COOKIE_NAME},
                function (cookie) {
                    if (cookie) {
                        deferredResponse.resolve(cookie.value);

                        //$.ajax({
                        //    type: "GET",
                        //    url: marketplaceURL + "api/admin/services",
                        //    headers: {'Cookie': AUTH_COOKIE_NAME + "=" + cookie.value}
                        //}).done(function (data) {
                        //    alert("I could invoke a service passing the cookie!: " + JSON.stringify(data, null, 2));
                        //}).fail(function (jqXHR) {
                        //    alert("Could not invoke service passing the cookie: " + jqXHR.status);
                        //});

                    } else {
                        alert("We need to define what happens when the cookie is not present");
                    }
                });
        } else {
            alert("We need to define what happens when there isn't a known marketplaceURL");
        }
        return deferredResponse.promise();
    },

    getAuthToken: function (options) {
        // Ugly code warning: mutable parameters: can accept either the marketplaceURL or an object with more options
		var marketplaceURL = options;
		var fromLogin = false;

		if (options && typeof options === 'object') {
			marketplaceURL = options.marketplaceURL;
			fromLogin = options.fromLogin;
		}
		var deferredResponse = $.Deferred();
		var self = this;

        if (marketplaceURL) {
            self.setInLocalStorage({key: self.lastUsedMarketplaceURL, value: marketplaceURL});

            // TODO See if we can use the refresh_token...
            self.getFromLocalStorage(auth_key_in_storage + marketplaceURL).done(function (accessToken) {
                if (accessToken) {
                    try {
                        var headers = {};
                        headers["Authorization"] = accessToken;

                        $.ajax({
                            type: "GET",
                            url: marketplaceURL + "api/admin/services",
                            headers: headers
                        }).done(function (data) {
                            deferredResponse.resolve(accessToken);
                        }).fail(function (jqXHR) {
                            if (jqXHR.status === 401 && !fromLogin) {
                                alert("Previously saved auth details have expired.\nYou need to re-authenticate");
                            }
                            self.fetchANewTokenFor(marketplaceURL).done(function (newToken) { deferredResponse.resolve(newToken); });
                        });
                    } catch (error) {
                        self.fetchANewTokenFor(marketplaceURL).done(function (newToken) { deferredResponse.resolve(newToken); });
                    }
                } else {
                    if (fromLogin) {
                        self.fetchANewTokenFor(marketplaceURL).done(function (newToken) { deferredResponse.resolve(newToken); });
                    } else {
                        alert(NOT_LOGGED_IN_MESSAGE);
                    }
                }
            });
        } else {
            alert(NOT_LOGGED_IN_MESSAGE);
        }
		return deferredResponse.promise();
	},

    loadURLInCurrentTab: function(url) {
        var deferredResponse = $.Deferred();
        chrome.tabs.query({active: true}, function(tab){
            chrome.tabs.update(tab.id, {url: url});
            deferredResponse.resolve();
        });
        return deferredResponse.promise();
    },

	changeExtensionPopUpIcon: function(loggedIn) {
		// TODO Make this work
		var deferredResponse = $.Deferred();
		chrome.browserAction.setIcon({
			'19': 'assets/images/icon19'+ (loggedIn ? '-on': '') + '.png',
			'38': 'assets/images/icon38'+ (loggedIn ? '-on': '') + '.png'
		}, function() {
			alert("If you see this, changing the icon color worked and you can safely remove this alert message");
		});
		deferredResponse.resolve();
		return deferredResponse.promise();
	},

	getFromLocalStorage: function (key) {
		var deferredResponse = $.Deferred();
		var self = this;

		if (haveAccessToChromeStorageAPI()) {
			chrome.storage.sync.get(key, function (value) {
				if (key) {
					// Single element
					deferredResponse.resolve(value ? value[key] : undefined);
				} else {
					// Multiple elements
					var allValues = Object.keys(value).map(function (item) {
						// TODO Improve this poor man's logic
						return (item.startsWith(auth_key_in_storage) || item === self.lastUsedMarketplaceURL) ? null: value[item];
					});
					allValues = allValues ? allValues.filter(function (val) {
						return val !== null;
					}) : [];
					deferredResponse.resolve(allValues);
				}
			});
		} else {
			deferredResponse.resolve(inMemoryDb.get(key));
		}
		return deferredResponse.promise();
	},

	setInLocalStorage: function (keyValueRq) {
		var deferredResponse = $.Deferred();

		if (haveAccessToChromeStorageAPI()) {
			var objectToSave = {};
			objectToSave[keyValueRq.key] = keyValueRq.value;
			chrome.storage.sync.set(objectToSave, function () {
				if (chrome.runtime.lasterror) {
					alert("Error when saving value in local storage: " + chrome.runtime.lasterror.message);
					deferredResponse.reject(chrome.runtime.lasterror.message);
				} else {
					deferredResponse.resolve();
				}
			});
		} else {
			deferredResponse.resolve(inMemoryDb.store(keyValueRq.key, keyValueRq.value));
		}

		return deferredResponse.promise();
	},

	deleteFromLocalStorage: function (key) {
		var deferredResponse = $.Deferred();

		if (haveAccessToChromeStorageAPI()) {
			chrome.storage.sync.remove(key, function () {
				if (chrome.runtime.lasterror) {
					alert("Error when deleting key '" + key + "' from local storage: " + chrome.runtime.lasterror.message);
					deferredResponse.reject(chrome.runtime.lasterror.message);
				} else {
					deferredResponse.resolve();
				}
			});
		} else {
			inMemoryDb.remove(key);
			deferredResponse.resolve();
		}

		return deferredResponse.promise();
	},

	/**
	 * Returns the id of the tab that is visible to user
	 * @returns $.Deferred() integer
	 */
	getActiveTabId: function() {

		var deferredResponse = $.Deferred();

		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {

			if (tabs.length < 1) {
				// must be running within popup
				deferredResponse.reject("couldn't find the active tab");
			}
			else {
				var tabId = tabs[0].id;
				deferredResponse.resolve(tabId);
			}
		});
		return deferredResponse.promise();
	},

	/**
	 * Execute a function within the active tab within content script
	 * @param request.fn	function to call
	 * @param request.request	request that will be passed to the function
	 */
	executeContentScript: function(request) {
		console.log("Executing request on the active tab: " + JSON.stringify(request, null, 2));

		var reqToContentScript = {
			contentScriptCall: true,
			fn: request.fn,
			request: request.request
		};
		var deferredResponse = $.Deferred();
		var deferredActiveTabId = this.getActiveTabId();
		deferredActiveTabId.done(function(tabId) {
			chrome.tabs.sendMessage(tabId, reqToContentScript, function(response) {
				deferredResponse.resolve(response);
			});
		});

		return deferredResponse;
	}
};

/**
 * @param location	configure from where the content script is being accessed (ContentScript, BackgroundPage, DevTools)
 * @returns BackgroundScript
 */
var getBackgroundScript = function(location) {

	// Handle calls from different places
	if(location === "BackgroundScript") {
		return BackgroundScript;
	}
	else if(location === "DevTools" || location === "ContentScript") {

		// if called within background script proxy calls to content script
		var backgroundScript = {};

		Object.keys(BackgroundScript).forEach(function(attr) {
			if(typeof BackgroundScript[attr] === 'function') {
				backgroundScript[attr] = function(request) {

					var reqToBackgroundScript = {
						backgroundScriptCall: true,
						fn: attr,
						request: request
					};

					var deferredResponse = $.Deferred();

					console.log("request to background script: " + JSON.stringify(reqToBackgroundScript, null, 2));

					chrome.runtime.sendMessage(reqToBackgroundScript, function(response) {
						deferredResponse.resolve(response);
					});

					return deferredResponse;
				};
			}
			else {
				backgroundScript[attr] = BackgroundScript[attr];
			}
		});

		return backgroundScript;
	}
	else {
		throw "Invalid BackgroundScript initialization - " + location;
	}
};
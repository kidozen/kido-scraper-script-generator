var prefix = 'Success payload=';
var auth_key_in_storage = 'token';

// TODO This does not work when running as a web application, refactor!
var haveAccessToChromeStorageAPI = chrome && chrome.storage;

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

	decodeToken: function (token) {
		var decodedToken = $.base64.decode(token);

		var parsedToken = decodedToken.split(",")[1].substr('{"access_token":"'.length - 1);

		parsedToken = parsedToken.substr(0, parsedToken.length - 1); // remove trailing "

		// TODO Re-instate this code when we solve the problem of the tab title being truncated by Google Chrome
		//var parsedToken = JSON.parse(decodedToken).access_token;

		console.log("Decoded token: " + parsedToken);

		return parsedToken;
	},

	fetchANewToken: function () {
		var deferredResponse = $.Deferred();
		var self = this;

		//TODO Take this URL from a web-service and store it in local storage, rather than having it hardcoded here.
		chrome.tabs.create(
			{url: "https://auth-qa.kidozen.com/v1/contoso/sign-in?wtrealm=_marketplace&wreply=urn-ietf-wg-oauth-2.0-oob&wa=wsignin1.0"},
			function (t) {
				var authTokenGrabber = function (tabId, changeInfo, tab) {
					if (tabId === t.id) {
						if ((tab && tab.title || '').indexOf(prefix) === 0) {

							var token = tab.title.substr(prefix.length);

							try {
								var accessToken = self.decodeToken(token);
								deferredResponse.resolve(accessToken);

								var saveRequest = {};
								saveRequest["key"] = auth_key_in_storage;
								saveRequest["value"] = accessToken;

								self.setInLocalStorage(saveRequest);
								chrome.tabs.onUpdated.removeListener(authTokenGrabber);
								chrome.tabs.remove(tab.id);

							} catch (err) {
								var errorMsg = "Problem while attempting to retrieve auth token: " + err;
								deferredResponse.reject(errorMsg);
								alert(errorMsg);
							}
						}
					}
				};
				chrome.tabs.onUpdated.addListener(authTokenGrabber);
			}
		);
		return deferredResponse.promise();
	},

	getAuthToken: function (marketplaceURL) {
		//TODO Use marketplaceURL

		var deferredResponse = $.Deferred();
		var self = this;

		// TODO See if we can use the refresh_token...
		self.getFromLocalStorage(auth_key_in_storage).done(function (accessToken) {
			if (accessToken) {
				alert("Found an access token, validating it...");
				try {
					var headers = {};
					headers["Authorization"] = accessToken;

					$.ajax({type: "HEAD", url: "https://contoso.local.kidozen.com/api/admin/services", headers: headers})
						.done(function (data) {
							alert("Previous access token is valid, returning it straight away...");

							alert("Currently running services: " + JSON.stringify(data, null, 2));
							deferredResponse.resolve(accessToken);
						}).fail(function(jqXHR) {
							var errorDetail = JSON.parse(jqXHR.responseText).error;
							alert("Previous access token is invalid (" + jqXHR.status + " / " + errorDetail + "). Fetching a new one...");
							self.fetchANewToken().done(function (newToken) { deferredResponse.resolve(newToken); });
						});
				} catch (error) {
					alert("Unable to parse existing token (" + error + "). Fetching a new one...");
					self.fetchANewToken().done(function (newToken) { deferredResponse.resolve(newToken); });
				}
			} else {
				alert("Token not present in local storage. Fetching a new one...");
				self.fetchANewToken().done(function (newToken) { deferredResponse.resolve(newToken); });
			}
		});
		return deferredResponse.promise();
	},

	getFromLocalStorage: function (key) {
		var deferredResponse = $.Deferred();

		if (haveAccessToChromeStorageAPI) {
			chrome.storage.sync.get(key, function (value) {
				if (key) {
					// Single element
					deferredResponse.resolve(value ? value[key] : undefined);
				} else {
					// Multiple elements
					var allValues = Object.keys(value).map(function (item) {
						// TODO Improve this poor man's logic
						return item === 'token' ? null: value[item];
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

		if (haveAccessToChromeStorageAPI) {
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

		if (haveAccessToChromeStorageAPI) {
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
				// @TODO must be running within popup. maybe find another active window?
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
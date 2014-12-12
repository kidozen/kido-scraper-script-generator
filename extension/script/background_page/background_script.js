angular.module('bgScript', ['chromeStorage', 'auth'])
    .config(function (chromeStorage, auth) {
        chrome.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {

                alert("Received message: from " + sender + ", request: " + JSON.stringify(request));

                console.log("chrome.runtime.onMessage", request);

                if (request.backgroundScriptCall) {
                    alert("processing backgroundScriptCall...");

                    var backgroundScript = getBackgroundScript("BackgroundScript");
                    var deferredResponse = backgroundScript[request.fn](request.request);
                    deferredResponse.done(function (response) {
                        sendResponse(response);
                    });

                    return true;
                } else if (request.chromeStorageCall) {
                    alert("processing chromeStorageCall...");

                    alert("Retrieving chromeStorage instance: " + JSON.stringify(chromeStorage, null, 2));

                    if (!chromeStorage) {
                        alert("Could not find an instance of chromeStorage!!!");
                        return false;
                    }
                    var deferredResponse = chromeStorage[request.fn](request.request);
                    deferredResponse.done(function (response) {
                        sendResponse(response);
                    });

                    return true;
                } else if (request.authCall) {
                    alert("processing authCall...");

                    alert("Retrieving auth instance: " + JSON.stringify(auth, null, 2));

                    if (!auth) {
                        alert("Could not find an instance of auth!!!");
                        return false;
                    }
                    var deferredResponse = auth [request.fn](request.request);
                    deferredResponse.done(function (response) {
                        sendResponse(response);
                    });

                    return true;
                }
            }
        );
    })
    .run();

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        console.log("chrome.runtime.onMessage", request);

        if (request.backgroundScriptCall) {

            var backgroundScript = getBackgroundScript("BackgroundScript");
            var deferredResponse = backgroundScript[request.fn](request.request)
            deferredResponse.done(function (response) {
                sendResponse(response);
            });

            return true;
        }
    }
);

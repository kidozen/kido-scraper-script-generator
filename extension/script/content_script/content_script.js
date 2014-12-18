chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

        console.log("chrome.runtime.onMessage", request);

        // Universal ContentScript communication handler
        if (request.contentScriptCall) {

            var contentScript = getContentScript("ContentScript");

            console.log("received ContentScript request", request);

            var deferredResponse = contentScript[request.fn](request.request);
            deferredResponse.done(function (response) {
                sendResponse(response);
            });

            return true;
        }
    }
);
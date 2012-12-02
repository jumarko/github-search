/*
 * Handles data sent via chrome.extension.sendRequest().
 * @param request Object Data sent in the request.
 * @param sender Object Origin of the request.
 * @param callbackFunction Function The method to call when the request completes - created worker will be passed
 *              as a parameter to this function
 */

function onRequest(request, sender, sendSearchResultResponse) {
    if (request.action === 'search_in_repo') {
        var searchWorker = createWorker(sendSearchResultResponse, request.repositoryName);
//        window.alert("Posting message to worker in background script repo="  + request.repositoryName);
        searchWorker.postMessage(request.repositoryName);
    }
};

/*
 * Add request listener
 */

chrome.extension.onRequest.addListener(onRequest);



function createWorker(sendSearchResultResponse, repositoryName) {
    var searchWorker = new Worker("search_worker.js");
//    searchWorker.onmessage = function(event) {
//        // TODO:
//        window.alert("Message from worker received!" + event.data);
//    };
    searchWorker.addEventListener('message', function (event) {
//        window.alert("result from search worker received!");
        sendSearchResultResponse({
            repository : repositoryName,
            text : event.data});
    }, false);

    searchWorker.addEventListener('error', function (event) {
        window.alert("error from search worker received!" + event.message);
    }, false);
    return searchWorker;
}




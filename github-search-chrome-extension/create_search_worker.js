/*
 * Add request listener for listening message comming from content script to this background worker.
 */

chrome.extension.onRequest.addListener(onRequest);



/*
 * Handles data sent via chrome.extension.sendRequest().
 * @param request Object Data sent in the request.
 * @param sender Object Origin of the request.
 * @param callbackFunction Function The method to call when the request completes - created worker will be passed
 *              as a parameter to this function
 */

function onRequest(request, sender, sendSearchResultResponse) {
    if (request.action === 'search_in_repo') {
        var searchWorker = createWorker(sendSearchResultResponse, request.repositoryRelativeUrl);
        var searchData = {
            'repositoryRelativeUrl' : request.repositoryRelativeUrl,
            'query' : request.query
        };
//        window.alert("Posting message to worker in background script data" + searchData);
        searchWorker.postMessage(searchData);
    }
}


function createWorker(sendSearchResultResponse, repositoryRelativeUrl) {
    var searchWorker = new Worker("search_worker.js");
//    searchWorker.onmessage = function(event) {
//        // TODO:
//        window.alert("Message from worker received!" + event.data);
//    };
    searchWorker.addEventListener('message', function (event) {
//        window.alert("result from repository=" + repositoryRelativeUrl +" search worker received!\n" + event.data);
        sendSearchResultResponse({
            repository : repositoryRelativeUrl,
            html : event.data.searchResultHtml });
    }, false);

    searchWorker.addEventListener('error', function (event) {
//        window.alert("error from search worker received!" + event.message);
    }, false);
    return searchWorker;
}




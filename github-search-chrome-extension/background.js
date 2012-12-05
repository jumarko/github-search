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
function onRequest(request, sender, response) {
    switch (request.action) {
        case 'search_in_repo' :
            searchInRepo(request, response);
            break;
        case 'get_organization_name' :
            getOrganizationNameFromOptions(response);
            break;
    }
}


function searchInRepo(request, sendSearchResultResponse) {
    var searchWorker = createWorker(sendSearchResultResponse, request.repositoryRelativeUrl);
    var searchData = {
        'repositoryRelativeUrl': request.repositoryRelativeUrl,
        'query': request.query
    };
//        window.alert("Posting message to worker in background script data" + searchData);
    searchWorker.postMessage(searchData);
}


var DEFAULT_ORGANIZATION_NAME = "gooddata";
function getOrganizationNameFromOptions(response) {
    if ( ! localStorage["organization-name"]) {
        localStorage["organization-name"] = DEFAULT_ORGANIZATION_NAME;
    }
    response( { "organizationName" : localStorage["organization-name"]} );
}

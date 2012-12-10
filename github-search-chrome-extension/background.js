/*
 * Add request listener for listening message comming from content script to this background worker.
 */
chrome.extension.onRequest.addListener(onRequest);

// setup sensible timeout to avoid infinite waiting for data
$.ajaxSetup( {timeout : 60000});


/*
 * Handles data sent via chrome.extension.sendRequest().
 * @param request Object Data sent in the request.
 * @param sender Object Origin of the request.
 * @param callbackFunction Function The method to call when the request completes - created worker will be passed
 *              as a parameter to this function
 */
function onRequest(request, sender, response) {
    switch (request.action) {
        case 'load_organization_data' :
            response({ "organizationName": getOrganizationNameFromOptions() });
            break;
        case 'search_in_repo' :
            searchInRepo(request, response);
            break;
    }


    // ------------------------  PRIVATE FUNCTIONS ---------------------------------------------------------------------

    /**
     * Search in repository identified by request.repositoryRelativeUrl for query request.query.
     *
     * @param request request containing at least two essential attributes. repositoryRelativeUrl and query
     * @param response callback to be called once search results are available
     *
     */
    function searchInRepo(request, response) {

        $.ajax({
            type: "GET",
            url: "https://github.com" + request.repositoryRelativeUrl + "/search?q=" + request.query,
            dataType: "html",
            success: function (responseHtml) {
                response({
                    repository: request.repositoryRelativeUrl,
                    html: responseHtml });
            },
            error: function (ajaxRequest, status, error) {
                response( { error : "Error while searching in repository=" + request.repositoryRelativeUrl +
                                    (error ? " -- " + error : "") }  );
            }
        });
    }



    /**
     * Loads organization name from extension options. If no organization name is specified in options
     * then default organization name is used and stored in options.
     *
     * @return name of organization stored in options or the default organizatio name as specified by
     * DEFAULT_ORGANIZATION_NAME variable
     */
    function getOrganizationNameFromOptions() {
        var DEFAULT_ORGANIZATION_NAME = "gooddata";
        if (!localStorage["organization-name"]) {
            localStorage["organization-name"] = DEFAULT_ORGANIZATION_NAME;
        }
        return localStorage["organization-name"];
    }


}




var ORGANIZATION_NAME;
var ALL_ORGANIZATION_REPOSITORIES;

function loadOrganization() {
    /**
     * Load name of github organization from saved options - user can changed this value, default is 'gooddata'.
     * @see background.js
     */
    function loadOrganizationNameFromOptions() {
        chrome.extension.sendRequest({
            action: 'get_organization_name'
        }, function (result) {
            ORGANIZATION_NAME = result.organizationName;
            // load repositories can be called only after we have organization name
            loadOrganizationRepositories(ORGANIZATION_NAME);
        });
    }

    /**
     * Loads all organization's repositories which are accessible by current user logged in GitHub.
     * @param organizationName name of GitHub organization
     * @see #loadOrganizationNameFromOptions - this function is called from it
     */
    function loadOrganizationRepositories(organizationName) {
        var organizationRepoNameRegex = new RegExp("^\/" + organizationName + "\/.+");
        var repositoriesRequest = $.ajax({
            type: "GET",
            url: "https://github.com/organizations/" + organizationName + "/ajax_your_repos",
            dataType: "html",
            success: function (responseHtml) {
                var repositoryRelativeUrls = [ ];
                $(responseHtml).find('a').each(function () {
                    var repoName = $(this).attr("href");
                    if (repoName && repoName.match(organizationRepoNameRegex)) {
                        repositoryRelativeUrls.push(repoName);
                    }
                });
                ALL_ORGANIZATION_REPOSITORIES = repositoryRelativeUrls;
            },
            error: function(request, status, error) {
                window.alert("Github search code extension error.\n\n" +
                    "Cannot load organization repositories.\n" +
                    "Check the organization name and that you have an access to that organization.\n\n" +
                    "Detail: " + error);
                ALL_ORGANIZATION_REPOSITORIES = [];
            }
        });
    }

    loadOrganizationNameFromOptions();
}

loadOrganization();


// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------


// ------------------------- JQUERY --------------------------

function getRepoAdvancedSearchBoxValue() {
    return $('input[placeholder="Search..."]').val();
}
function getRepoBasicSearchBoxValue() {
    return $('input[placeholder*="Search source code"]').val();
}
function getTopLevelBasicSearchBoxValue() {
    if ($('input[name="q"]') && $('input[name="q"]').length > 0) {
        return $('input[name="q"]')[0].value;
    }
    // TODO: following does not work
//    return $('input[placeholder="Search source code"]').val();
}

function getTopLevelAdvancedSearchBoxValue() {
    if ($('input[name="q"]') && $('input[name="q"]').length > 1) {
        return $('input[name="q"]')[1].value;
    }

    // TODO: following does not work
//    return $('input[placeholder="Search or type a command"]').val();
}


$(document).ready(function () {
    $("form").submit(function () {
        // user must prefixed query with "all:" to do global search across all repos

        var searchQueryString;
        if (getRepoAdvancedSearchBoxValue()) {
            searchQueryString = getRepoAdvancedSearchBoxValue();
        } else if (getRepoBasicSearchBoxValue()) {
            searchQueryString = getRepoBasicSearchBoxValue()
            // TODO: top level search box don't work right now
        } else if (getTopLevelAdvancedSearchBoxValue()) {
            searchQueryString = getTopLevelAdvancedSearchBoxValue();
        } else if (getTopLevelBasicSearchBoxValue()) {
            searchQueryString = getTopLevelBasicSearchBoxValue();
        }
//        window.alert("Search with jquery querystring=" + searchQueryString);
        if (searchQueryString && searchQueryString.match(/all:.+/)) {
            var allReposSearchQuery = searchQueryString.substring(4);
//            window.alert("Search in all repos query=" + allReposSearchQuery );
            searchInAllRepositories(allReposSearchQuery);
            return false;
        }

        // pass logic to normal repo search
        return true;
    });
});
// ------------------------- End Of JQUERY --------------------------


function searchInAllRepositories(searchQuery) {

    var SEARCH_RESULT_ELEMENT_ID_PREFIX = "searchResultsFor_";
    /** Id of element which is used as an anchor in existing github html page - all search results will be inserted
     * BEFORE THIS ELEMENT.*/
    var SEARCH_PAGE_ANCHOR_ELEMENT_ID_SELECTOR = "#footer-push";


    function showSearchInProgressPopup() {
        $.blockUI({ message: '<h1>Searching in all "' + ORGANIZATION_NAME + '" repositories...</h1>' +
            '                     <p>In the meantime you can scroll down to the bottom of the page and see actual results.</p>' });
    }

    function finishSearchInProgressPopup() {
        $.unblockUI();
    }


    function scrollDownToBottomOfPage() {
        $(document).scrollTop($(document).height());
    }

    function writeSeparator() {
        $('<div> <br/> <hr/> <br/> </div>').insertBefore($(SEARCH_PAGE_ANCHOR_ELEMENT_ID_SELECTOR));
    }

    /**
     * Turns candidate id string to valid id element replacing all slashes "/" with underscores "_".
     * @param string representing Id with potentially unsafe characters "/"
     * @return valid id
     */
    function changeToValidId(string) {
        return string.replace(/\//g, "_");
    }

    /**
     * Removes all elements which holds previous search results (if any)
     */
    function removePreviousResults() {
        $("[id^=" + SEARCH_RESULT_ELEMENT_ID_PREFIX + "]").remove();
    }

    function displaySearchResultsSummary(result) {
        if (result.errorMessage) {
            window.alert("There was some error while searching. Results might be incomplete!\nError message: "
                + result.errorMessage);
        }

        var detailResultMessage;
        if (result.matchedReposCount) {
            detailResultMessage = result.matchedReposCount
                + (result.matchedReposCount == 1 ? ' repository ' : ' repositories ')
                + 'matched.';
        } else {
            detailResultMessage = 'Sorry, no results were found.';
        }
        $('<div class="indent" id="' + SEARCH_RESULT_ELEMENT_ID_PREFIX + '"><h2>Search Finished</h2>' +
            '<p>' + detailResultMessage + '</p></div>')
            .insertBefore($(SEARCH_PAGE_ANCHOR_ELEMENT_ID_SELECTOR));

    }

    /**
     * Final callback that will be called once searching for all repositories has been finished.
     */
    function allSearchesFinished(result) {
        finishSearchInProgressPopup();
        displaySearchResultsSummary(result);
        scrollDownToBottomOfPage();
    }

    removePreviousResults();


    try {
        if ( ! ALL_ORGANIZATION_REPOSITORIES
            || ALL_ORGANIZATION_REPOSITORIES.length == 0) {
            window.alert('No repositories for organization "' + ORGANIZATION_NAME + '" have been found.');
            return;
        }

        showSearchInProgressPopup();
        scrollDownToBottomOfPage();
        writeSeparator();

        var numberOfSearchesFinished = 0;
        var matchedReposCount = 0;
        for (var repo in ALL_ORGANIZATION_REPOSITORIES) {
            var repository = ALL_ORGANIZATION_REPOSITORIES[repo];
            chrome.extension.sendRequest({
                action: 'search_in_repo',
                repositoryRelativeUrl: repository,
                query: searchQuery
            }, function (searchResult) {
                var searchResultBody = getSearchResultElement(searchResult.html, "files");
//            window.alert("search result body=" + searchResultBody);
                if (searchResultBody) {
                    var searchResultsElementId = SEARCH_RESULT_ELEMENT_ID_PREFIX + changeToValidId(searchResult.repository);
                    var searchResultEnvelope = $('<div class="indent" id="' + searchResultsElementId + '">');
                    var searchResultTitle = $('<h2>Search result for query "' + searchQuery + '" ' +
                        'in repository <a href="https://github.com' + searchResult.repository + '">' + searchResult.repository + '</a></h2>');
                    $(searchResultEnvelope).append(searchResultTitle);
                    $(searchResultEnvelope).append(searchResultBody);

                    // separate more cleanly from other repository search results via more empty new lines
                    searchResultEnvelope.append($("<br />"));
                    searchResultEnvelope.append($("<br />"));
                    searchResultEnvelope.append($("<br />"));

//                window.alert("search result envelope=" + searchResultEnvelope);
                    searchResultEnvelope.insertBefore($(SEARCH_PAGE_ANCHOR_ELEMENT_ID_SELECTOR));
                    scrollDownToBottomOfPage();

                    matchedReposCount++;
                }

                numberOfSearchesFinished++;
                if (numberOfSearchesFinished >= ALL_ORGANIZATION_REPOSITORIES.length) {
                    allSearchesFinished({ 'matchedReposCount': matchedReposCount });
                }
            });
        }
    } catch (error) {
        allSearchesFinished({ 'errorMessage': error.message });
    }
}


function getSearchResultElement(htmlText, elementId) {
//    window.alert("Search result=" + htmlText);
    // don't work
//    var htmlDocument = string2dom(htmlText)["doc"];
    var htmlDocument = $(htmlText);
//    window.alert("Search result html document=" + htmlDocument);
    var searchResults = htmlDocument.find("#" + elementId);
    return (searchResults.length == 1) ? searchResults : null;
}



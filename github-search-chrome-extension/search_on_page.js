var githubOrganization = {
    name: "",
    repositories: [],

    /** true or false if both name and repositories are filled */
    organizationDataLoaded: function() {
        return githubOrganization.name && githubOrganization.repositories && githubOrganization.repositories.length > 0;
    },

    /**
     * Load organization data - name and repositories.
     *
     * @param callback optional callback to be called if data has been loaded successfully
     */
    loadOrganizationData: function (callback) {
        chrome.extension.sendRequest({
            action: 'load_organization_data'
        }, function (result) {
            if (result.error && result.error.message) {
                $.unblockUI();
                jAlert('error',
                    result.error.message,
                    'Error while loading organization data');
            } else {
                githubOrganization.name = result.organizationName;
                loadOrganizationRepositories(githubOrganization.name);
            }
        });

        /**
         * TODO: this could be located in background.js - However, I was not able to make this work:
         *      ajax http call at "https://github.com/organizations/" + organizationName + "/ajax_your_repos"
         *      kept returning "Not Acceptable" when running from background.js.
         *
         * Loads all organization's repositories which are accessible by current user logged in GitHub.
         *
         * @param organizationName name of GitHub organization
         * @see loadOrganizationNameFromOptions - this function is called from it
         */
        function loadOrganizationRepositories(organizationName) {

            var organizationRepoNameRegex = new RegExp("^\/" + organizationName + "\/.+");
            $.ajax({
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
                    githubOrganization.repositories = repositoryRelativeUrls;
                    callback(organizationName, githubOrganization.repositories);
                },
                error: function (request, status, error) {
                    $.unblockUI();
                    jAlert('error',
                        'Cannot load repositories for organization "' + organizationName + '".\n' +
                            'Check the organization name and ensure you have an access to that organization.\n\n' +
                            'Error message: ' + error,
                        'Github search code extension error.');
                }
            });
        }
    }
}


$(document).ready(function () {

    // setup sensible timeout to avoid infinite waiting for data
    $.ajaxSetup( {timeout : 60000});

    /**
     * Checks given query and if it starts with prefix "all:" then perform search in all repositories
     * @param query potential query for all repositories
     * @return {boolean} if query is for searching in all repositories, false otherwise
     */
    function checkQueryAndSearchInAllRepos(query) {
        if (query && query.match(/all:.+/)) {
            var allReposSearchQuery = query.substring(4);
            // do not allow searches for single characters - the potantial result is very large and this does not much sense
            if (allReposSearchQuery.length < 2) {
                jAlert('error',
                    'Enter at least TWO characters for searching.',
                    'Malformed search query');
            } else {
                searchInAllRepositories(allReposSearchQuery);
            }
            return true;
        }

        return false;
    }


    var QUERY_URL_PARAMETER_REGEX = /[\?&]q=([^&]+)/;

    /**
     * Checks whether current page location contains proper pathname ("search")
     * and url (GET) parameter for query ("q")
     */
    function queryUrlParameterSet() {
        function urlPathEndsWithSearch() {
            return location.pathname && location.pathname.match(/.*\/search/);
        }

        function firstUrlParameterIsQuery() {
            return location.search && location.search.match(QUERY_URL_PARAMETER_REGEX);
        }

        return urlPathEndsWithSearch() && firstUrlParameterIsQuery();
    }

    if (queryUrlParameterSet())  {
        var searchQueryParam = location.search.match(QUERY_URL_PARAMETER_REGEX);
        if (searchQueryParam) {
            // we have to decode value because it can contains special chars (typically collon in prefix "all:")
            var searchQueryParamValue = decodeURIComponent(searchQueryParam[1]);
            checkQueryAndSearchInAllRepos(searchQueryParamValue);
        }

    }
});


function searchInAllRepositories(searchQuery) {

    var SEARCH_RESULT_ELEMENT_ID_PREFIX = "searchResultsFor_";
    /** Id of element which is used as an anchor in existing github html page - all search results will be inserted
     * BEFORE THIS ELEMENT.*/
    var SEARCH_PAGE_ANCHOR_ELEMENT_ID_SELECTOR = "#footer-push";


    function showSearchInProgressPopup() {
        $.blockUI({ message: '<h1>Searching in all "' + githubOrganization.name + '" repositories...</h1>' +
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
            jAlert('error',
                'There was some error while searching. Results might be incomplete!\nError message: \n    ' + result.errorMessage,
                'Search error');
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


    /**
     * Performs actual search in all organization repositories.
     */
    function performSearch() {
        $.unblockUI();

        if ( ! githubOrganization.organizationDataLoaded()) {
            jAlert('error',
                'No repository for organization "' + githubOrganization.name + '" has been found.',
                'No repository found');
            return;
        }

        try {
            removePreviousResults();
            showSearchInProgressPopup();
            scrollDownToBottomOfPage();
            writeSeparator();

            var numberOfSearchesFinished = 0;
            var matchedReposCount = 0;
            var searchResultError = '';
            for (var repo in githubOrganization.repositories) {
                if (searchResultError) {
                    // do not continue in searching if there has already been some error!
                    break;
                }
                var repository = githubOrganization.repositories[repo];
                chrome.extension.sendRequest({
                    action: 'search_in_repo',
                    repositoryRelativeUrl: repository,
                    query: searchQuery
                }, function (searchResult) {
                    if (searchResult.error) {
                        searchResultError += "\n" + searchResult.error;
                    } else {
                        var searchResultBody = getSearchResultElement(searchResult.html, "files");
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

                            searchResultEnvelope.insertBefore($(SEARCH_PAGE_ANCHOR_ELEMENT_ID_SELECTOR));
                            scrollDownToBottomOfPage();

                            matchedReposCount++;
                        }
                    }

                    numberOfSearchesFinished++;
                    if (numberOfSearchesFinished >= githubOrganization.repositories.length) {
                        allSearchesFinished({ 'matchedReposCount': matchedReposCount , 'errorMessage' : searchResultError });
                    }
                });
            }
        } catch (error) {
            allSearchesFinished({ 'errorMessage': error.message });
        }
    }


    if ( ! githubOrganization.organizationDataLoaded()) {
        try {
            $.blockUI({ message: '<h2>Loading data for github organization...</h2>' });
            githubOrganization.loadOrganizationData(performSearch);
        } catch (e) {
            $.unblockUI();
        }
        return;
    }

    performSearch();
}


function getSearchResultElement(htmlText, elementId) {
    var htmlDocument = $(htmlText);
    var searchResults = htmlDocument.find("#" + elementId);
    return (searchResults.length == 1) ? searchResults : null;
}



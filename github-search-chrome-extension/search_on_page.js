// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function loadAllGoodDataRepos() {
    var repositoriesRequest = $.ajax({
        type : "GET",
        url: "https://github.com/organizations/gooddata/ajax_your_repos",
        dataType: "html"
    });


    repositoriesRequest.done(function(responseHtml) {
        var repositoryRelativeUrls = [ ];
        $(responseHtml).find('a').each(function ()
        {
            var repoName = $(this).attr("href");
            if (repoName && repoName.match(/^\/gooddata\/.+/)) {
                repositoryRelativeUrls.push(repoName);
            }
        });
        ALL_GOODDATA_REPOSITORIES = repositoryRelativeUrls;
    });
}

var ALL_GOODDATA_REPOSITORIES = loadAllGoodDataRepos();
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


$(document).ready(function() {
    $("form").submit(function() {
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






var SEARCH_RESULT_ELEMENT_ID_PREFIX = "searchResultsFor_";
function searchInAllRepositories(searchQuery) {
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


    removePreviousResults();

    for (var repo in ALL_GOODDATA_REPOSITORIES) {
        var repository = ALL_GOODDATA_REPOSITORIES[repo];
        chrome.extension.sendRequest({
            action: 'search_in_repo',
            repositoryRelativeUrl: repository,
            query: searchQuery
        }, function (searchResult) {
            var searchResultBody = getSearchResultElement(searchResult.html, "files");
//            window.alert("search result body=" + searchResultBody);
            if (searchResultBody) {

                var searchResultsElementId = SEARCH_RESULT_ELEMENT_ID_PREFIX + changeToValidId(searchResult.repository);
                var searchResultEnvelope = $('<div id="' + searchResultsElementId + '">');
                var searchResultTitle = $('<h2>Search result for query=<i>"' + searchQuery
                                                + '</i>" in repository=<i>"' + searchResult.repository + '"</i></h2>');
                $(searchResultEnvelope).append(searchResultTitle);
                $(searchResultEnvelope).append(searchResultBody);

                // separate more cleanly from other repository search results via more empty new lines
                searchResultEnvelope.append($("<br />"));
                searchResultEnvelope.append($("<br />"));
                searchResultEnvelope.append($("<br />"));

//                window.alert("search result envelope=" + searchResultEnvelope);
                searchResultEnvelope.insertBefore($("#footer-push"));
            }
        });
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



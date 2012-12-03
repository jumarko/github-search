// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var ALL_GOODDATA_REPOSITORIES = [
    "gooddata/gooddata.github.com",
    "gooddata/GoodData-CL",
    "gooddata/gooddata-ruby",
    "gooddata/gooddata-labs",
    "gooddata/yui3",
    "gooddata/gooddata-php",
    "gooddata/sfdc_tests",
    "gooddata/ms_projects",
    "gooddata/gdc-taskman",
    "gooddata/gdc-cache",
    "gooddata/gdc-expression-language",
    "gooddata/gdc-jmx-log4j-management",
    "gooddata/gdc-clover",
    "gooddata/gdc-backend",
    "gooddata/gdc-auditlog",
    "gooddata/gdc-http-client",
    "gooddata/gdc-exception",
    "gooddata/gdc-jvm-monitoring",
    "gooddata/gdc-maven",
    "gooddata/gdc-json",
    "gooddata/gdc-websupport",
    "gooddata/gdc-dlm-client",
    "gooddata/gdc-security",
    "gooddata/gdc-clover-engine",
    "gooddata/pbg_prototypes",
    "gooddata/gdc-document-storage",
    "gooddata/gdc-rest-api-support",
    "gooddata/gdc-lang",
    "gooddata/pipetools",
    "gooddata/puppet",
    "gooddata/gdc-test-support",
    "gooddata-puppet",
    "gooddata/gdc-webapp-modules",
    "gooddata/sli-hash-benchmarks",
    "gooddata/qt-interpreter",
    "gooddata/qa",
    "gooddata/maql-reference",
    "gooddata/gdc-downloaders",
    "gooddata/opsutils",
    "gooddata/gdc-systemtap",
    "gooddata/msf",
    "gooddata/ic2",
    "gooddata/rolapps",
    "gooddata/maracuja",
    "gooddata/gdc-ldm-modeler",
    "gooddata/gdc-selftest",
    "gooddata/gdc-msf-doc",
    "gooddata/gdc-c3",
    "gooddata/gdc-scheduler",
    "gooddata/sso-example",
    "gooddata/a-team-weaponry",
    "gooddata/lr-quality",
    "gooddata/gdc-connectors",
    "gooddata/gcf",
    "gooddata/gdc-event-store",
    "gooddata/aqe",
    "gooddata/cloudconnect",
    "gooddata/ms_rakefile_source",
    "gooddata/ms_gemfile",
    "gooddata/gdc-erlang-libs",
    "gooddata/gdc-webapp",
    "gooddata/gdc-python",
    "gooddata/devcfg-backup",
    "gooddata/gdc-admin-console",
    "gooddata/gdc-c4",
    "gooddata/common-min",
    "gooddata/gdc-c3server",
    "gooddata/java-support-tools",
    "gooddata/gdc-cc-console",
    "gooddata/client",
    "gooddata/gooddata-api-docs",
    "gooddata/gdc-c3client",
    "gooddata/puppet",
    "gooddata/gdc-js-style",
    "gooddata/gdc-uploaders"
]
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






function searchInAllRepositories(searchQuery) {
    for (var repo in ALL_GOODDATA_REPOSITORIES) {
        var repository = ALL_GOODDATA_REPOSITORIES[repo];
        chrome.extension.sendRequest({
            action: 'search_in_repo',
            repositoryName: repository,
            query: searchQuery
        }, function (searchResult) {
            var searchResultBody = getSearchResultElement(searchResult.html, "files");
//            window.alert("search result body=" + searchResultBody);
            if (searchResultBody) {
                var searchResultEnvelope = $("<h2>Search result for " + searchResult.repository + "</h2>");;
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



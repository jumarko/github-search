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
                var searchResultEnvelope = document.createElement("h2");

                searchResultEnvelope.textContent = "Search result for " + searchResult.repository;
                searchResultEnvelope.appendChild(searchResultBody);

                // separate more cleanly from other repository search results via more empty new lines
                searchResultEnvelope.appendChild(searchResultBody);
                searchResultEnvelope.appendChild(document.createElement("br"));
                searchResultEnvelope.appendChild(document.createElement("br"));
                searchResultEnvelope.appendChild(document.createElement("br"));

//                window.alert("search result envelope=" + searchResultEnvelope);
                document.body.appendChild(searchResultEnvelope);
            }
        });
    }


}


// ------------------------------------------- String 2 DOM ------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

function getSearchResultElement(htmlText, elementId) {
//    window.alert("Search result=" + htmlText);
    console.log("Search result="+ htmlText);
    var htmlDocument = string2dom(htmlText)["doc"];
//    window.alert("Search result html document=" + htmlDocument);
    return htmlDocument.getElementById(elementId);

//    var matchingElements = [];
//    var allElements = element.getElementsByTagName('*');
//    for (var i = 0; i < allElements.length; i++)
//    {
//        if (allElements[i].getAttribute(attribute))
//        {
//            // Element exists with attribute. Add to array.
//            matchingElements.push(allElements[i]);
//        }
//    }
//    return matchingElements;
}


/*
 @param String html    The string with HTML which has be converted to a DOM object
 @param func callback  (optional) Callback(HTMLDocument doc, function destroy)
 @returns              undefined if callback exists, else: Object
 HTMLDocument doc  DOM fetched from Parameter:html
 function destroy  Removes HTMLDocument doc.         */
function string2dom(html, callback) {
    /* Sanitise the string */
    html = sanitiseHTML(html);
    /*Defined at the bottom of the answer*/

    /* Create an IFrame */
    var iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    function destroy() {
        iframe.parentNode.removeChild(iframe);
    }

    if (callback) callback(doc, destroy);
    else return {"doc": doc, "destroy": destroy};
}

/* @name sanitiseHTML
 @param String html  A string representing HTML code
 @return String      A new string, fully stripped of external resources.
 All "external" attributes (href, src) are prefixed by data- */

function sanitiseHTML(html) {
    /* Adds a <!-\"'--> before every matched tag, so that unterminated quotes
     aren't preventing the browser from splitting a tag. Test case:
     '<input style="foo;b:url(0);><input onclick="<input type=button onclick="too() href=;>">' */
    var prefix = "<!--\"'-->";
    /*Attributes should not be prefixed by these characters. This list is not
     complete, but will be sufficient for this function.
     (see http://www.w3.org/TR/REC-xml/#NT-NameChar) */
    var att = "[^-a-z0-9:._]";
    var tag = "<[a-z]";
    var any = "(?:[^<>\"']*(?:\"[^\"]*\"|'[^']*'))*?[^<>]*";
    var etag = "(?:>|(?=<))";

    /*
     @name ae
     @description          Converts a given string in a sequence of the
     original input and the HTML entity
     @param String string  String to convert
     */
    var entityEnd = "(?:;|(?!\\d))";
    var ents = {" ": "(?:\\s|&nbsp;?|&#0*32" + entityEnd + "|&#x0*20" + entityEnd + ")",
        "(": "(?:\\(|&#0*40" + entityEnd + "|&#x0*28" + entityEnd + ")",
        ")": "(?:\\)|&#0*41" + entityEnd + "|&#x0*29" + entityEnd + ")",
        ".": "(?:\\.|&#0*46" + entityEnd + "|&#x0*2e" + entityEnd + ")"};
    /*Placeholder to avoid tricky filter-circumventing methods*/
    var charMap = {};
    var s = ents[" "] + "*";
    /* Short-hand space */
    /* Important: Must be pre- and postfixed by < and >. RE matches a whole tag! */
    function ae(string) {
        var all_chars_lowercase = string.toLowerCase();
        if (ents[string]) return ents[string];
        var all_chars_uppercase = string.toUpperCase();
        var RE_res = "";
        for (var i = 0; i < string.length; i++) {
            var char_lowercase = all_chars_lowercase.charAt(i);
            if (charMap[char_lowercase]) {
                RE_res += charMap[char_lowercase];
                continue;
            }
            var char_uppercase = all_chars_uppercase.charAt(i);
            var RE_sub = [char_lowercase];
            RE_sub.push("&#0*" + char_lowercase.charCodeAt(0) + entityEnd);
            RE_sub.push("&#x0*" + char_lowercase.charCodeAt(0).toString(16) + entityEnd);
            if (char_lowercase != char_uppercase) {
                RE_sub.push("&#0*" + char_uppercase.charCodeAt(0) + entityEnd);
                RE_sub.push("&#x0*" + char_uppercase.charCodeAt(0).toString(16) + entityEnd);
            }
            RE_sub = "(?:" + RE_sub.join("|") + ")";
            RE_res += (charMap[char_lowercase] = RE_sub);
        }
        return(ents[string] = RE_res);
    }

    /*
     @name by
     @description  second argument for the replace function.
     */
    function by(match, group1, group2) {
        /* Adds a data-prefix before every external pointer */
        return group1 + "data-" + group2
    }

    /*
     @name cr
     @description            Selects a HTML element and performs a
     search-and-replace on attributes
     @param String selector  HTML substring to match
     @param String attribute RegExp-escaped; HTML element attribute to match
     @param String marker    Optional RegExp-escaped; marks the prefix
     @param String delimiter Optional RegExp escaped; non-quote delimiters
     @param String end       Optional RegExp-escaped; forces the match to
     end before an occurence of <end> when
     quotes are missing
     */
    function cr(selector, attribute, marker, delimiter, end) {
        if (typeof selector == "string") selector = new RegExp(selector, "gi");
        marker = typeof marker == "string" ? marker : "\\s*=";
        delimiter = typeof delimiter == "string" ? delimiter : "";
        end = typeof end == "string" ? end : "";
        var is_end = end && "?";
        var re1 = new RegExp("(" + att + ")(" + attribute + marker + "(?:\\s*\"[^\"" + delimiter + "]*\"|\\s*'[^'" + delimiter + "]*'|[^\\s" + delimiter + "]+" + is_end + ")" + end + ")", "gi");
        html = html.replace(selector, function (match) {
            return prefix + match.replace(re1, by);
        });
    }

    /*
     @name cri
     @description            Selects an attribute of a HTML element, and
     performs a search-and-replace on certain values
     @param String selector  HTML element to match
     @param String attribute RegExp-escaped; HTML element attribute to match
     @param String front     RegExp-escaped; attribute value, prefix to match
     @param String flags     Optional RegExp flags, default "gi"
     @param String delimiter Optional RegExp-escaped; non-quote delimiters
     @param String end       Optional RegExp-escaped; forces the match to
     end before an occurence of <end> when
     quotes are missing
     */
    function cri(selector, attribute, front, flags, delimiter, end) {
        if (typeof selector == "string") selector = new RegExp(selector, "gi");
        flags = typeof flags == "string" ? flags : "gi";
        var re1 = new RegExp("(" + att + attribute + "\\s*=)((?:\\s*\"[^\"]*\"|\\s*'[^']*'|[^\\s>]+))", "gi");

        end = typeof end == "string" ? end + ")" : ")";
        var at1 = new RegExp('(")(' + front + '[^"]+")', flags);
        var at2 = new RegExp("(')(" + front + "[^']+')", flags);
        var at3 = new RegExp("()(" + front + '(?:"[^"]+"|\'[^\']+\'|(?:(?!' + delimiter + ').)+)' + end, flags);

        var handleAttr = function (match, g1, g2) {
            if (g2.charAt(0) == '"') return g1 + g2.replace(at1, by);
            if (g2.charAt(0) == "'") return g1 + g2.replace(at2, by);
            return g1 + g2.replace(at3, by);
        };
        html = html.replace(selector, function (match) {
            return prefix + match.replace(re1, handleAttr);
        });
    }

    /* <meta http-equiv=refresh content="  ; url= " > */
    html = html.replace(new RegExp("<meta" + any + att + "http-equiv\\s*=\\s*(?:\"" + ae("refresh") + "\"" + any + etag + "|'" + ae("refresh") + "'" + any + etag + "|" + ae("refresh") + "(?:" + ae(" ") + any + etag + "|" + etag + "))", "gi"), "<!-- meta http-equiv=refresh stripped-->");

    /* Stripping all scripts */
    html = html.replace(new RegExp("<script" + any + ">\\s*//\\s*<\\[CDATA\\[[\\S\\s]*?]]>\\s*</script[^>]*>", "gi"), "<!--CDATA script-->");
    html = html.replace(/<script[\S\s]+?<\/script\s*>/gi, "<!--Non-CDATA script-->");
    cr(tag + any + att + "on[-a-z0-9:_.]+=" + any + etag, "on[-a-z0-9:_.]+");
    /* Event listeners */

    cr(tag + any + att + "href\\s*=" + any + etag, "href");
    /* Linked elements */
    cr(tag + any + att + "src\\s*=" + any + etag, "src");
    /* Embedded elements */

    cr("<object" + any + att + "data\\s*=" + any + etag, "data");
    /* <object data= > */
    cr("<applet" + any + att + "codebase\\s*=" + any + etag, "codebase");
    /* <applet codebase= > */

    /* <param name=movie value= >*/
    cr("<param" + any + att + "name\\s*=\\s*(?:\"" + ae("movie") + "\"" + any + etag + "|'" + ae("movie") + "'" + any + etag + "|" + ae("movie") + "(?:" + ae(" ") + any + etag + "|" + etag + "))", "value");

    /* <style> and < style=  > url()*/
    cr(/<style[^>]*>(?:[^"']*(?:"[^"]*"|'[^']*'))*?[^'"]*(?:<\/style|$)/gi, "url", "\\s*\\(\\s*", "", "\\s*\\)");
    cri(tag + any + att + "style\\s*=" + any + etag, "style", ae("url") + s + ae("(") + s, 0, s + ae(")"), ae(")"));

    /* IE7- CSS expression() */
    cr(/<style[^>]*>(?:[^"']*(?:"[^"]*"|'[^']*'))*?[^'"]*(?:<\/style|$)/gi, "expression", "\\s*\\(\\s*", "", "\\s*\\)");
    cri(tag + any + att + "style\\s*=" + any + etag, "style", ae("expression") + s + ae("(") + s, 0, s + ae(")"), ae(")"));
    return html.replace(new RegExp("(?:" + prefix + ")+", "g"), prefix);
}

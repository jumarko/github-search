
self.onmessage = function(event) {
    if (event.data) {
        searchInRepository(event.data.repositoryRelativeUrl, event.data.query);
    }
}

function searchInRepository(repositoryRelativeUrl, query) {
    var req = new XMLHttpRequest();
    req.open(
        "GET",
        "https://github.com" + repositoryRelativeUrl + "/search?q=" + query,
        true);
    req.onload = function () {
        postMessage({ searchResultHtml : req.responseText });
    }

    req.send(null);
}






self.onmessage = function(event) {
    if (event.data) {
        searchInRepository(event.data.repositoryName, event.data.query);
    }
}

function searchInRepository(repositoryName, query) {
    var req = new XMLHttpRequest();
    req.open(
        "GET",
        "https://github.com/" + repositoryName + "/search?q=" + query,
        true);
    req.onload = function () {
        postMessage({ searchResultHtml : req.responseText });
    }

    req.send(null);
}





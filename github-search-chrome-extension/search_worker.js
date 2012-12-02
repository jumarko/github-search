
self.onmessage = function(event) {
    if (event.data) {
        var repositoryName = event.data;
        searchInRepository(repositoryName);
    }
}

function searchInRepository(repositoryName) {
    var req = new XMLHttpRequest();
    req.open(
        "GET",
        "https://github.com/" + repositoryName + "/search?q=HttpTemplate",
        true);
    req.onload = function () {
        postMessage(req.responseText);
    }

    req.send(null);
}





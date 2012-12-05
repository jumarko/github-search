

function createWorker(sendSearchResultResponse, repositoryRelativeUrl) {
    var searchWorker = new Worker("search_worker.js");
    searchWorker.addEventListener('message', function (event) {
//        window.alert("result from repository=" + repositoryRelativeUrl +" search worker received!\n" + event.data);
        sendSearchResultResponse({
            repository : repositoryRelativeUrl,
            html : event.data.searchResultHtml });

        // close worker to release precious resources - it would be more graceful to pass "close" message to the worker,
        // but at this point we are pretty sure that worker has finished all required stuff.
        searchWorker.terminate();
    }, false);

    searchWorker.addEventListener('error', function (event) {
//        window.alert("error from search worker received!" + event.message);
        searchWorker.terminate();
    }, false);
    return searchWorker;
}




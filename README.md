#github-search


Extension plugin(s) for searching in source code of all GitHub organization repositories.

Right now, only Google Chrome browser is supported. 


## Google Chrome Extension 

All source files related to this extension are placed in directory 'github-search-chrome-extension'.
Packaged extension is available directly from [Chrome Web Store](https://chrome.google.com/webstore/detail/github-repositories-code/kekdlaiopeadgpbjbcedfiladbfehplk) 
or [Downloads](https://github.com/jumarko/github-search/downloads) page.

### Installation
The most straightforward option is to install extension directly from [Chrome Web Store](https://chrome.google.com/webstore/detail/github-repositories-code/kekdlaiopeadgpbjbcedfiladbfehplk).

Alternatively, you can follow these steps to install extension manually:

1. Download .crx file [github-search-chrome-extension] (https://github.com/downloads/jumarko/github-search/github-search-chrome-extension-0.4.crx).
2. Open Chrome web browser.
3. Go to the Extensions page (Chrome menu on toolbar -> Tools -> Extensions).
4. Drag and Drop file github-search-chrome-extension.crx to the Extensions page.
5. Setup proper organization name (default is 'gooddata') in 'Github repositories code search' extension options. You can access options page either via Extensions page ('Github repositories code search' extension -> Options) or via an extension icon (right click GitHub "cat" icon in the toolbar -> "Options" from popup menu). 



## Usage
You can now use 3 all GitHub search boxes for performing searches across all you (private/organization) repositories.
Furthermore, you can pass query as a get parameter "q".

YOU HAVE TO PREFIX YOUR SEARCH QUERY WITH "all:" to perform searches across all repositories.
Otherwise only standard github search is performed.

Example query (will search string 'HttpClient' in all organization's repositories):
    
    all:HttpClient

### Video
There is a short [introductory video](https://github.com/downloads/jumarko/github-search/github-search-code-repositories-in-action.mov) in Downloads section.

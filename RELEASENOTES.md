#Github search code repositories extension - RELEASE NOTES

## 0.3
* Unified approch to search - always via URL GEt parameter "q".
* Default timeout 60 seconds added to all AJAX calls to prevent from infinite waiting for data if connection is down.
* New fancy error dialog provided as a replacement for all ugly javascript alert windows.

## 0.2
* Web workers stuff completely removed. Complicated and fragile logic introduced by web workers have been cleaned up
and is simpler and more robust.
* List of repositories is loaded lazily only when first "all:" search is performed. This solution is more stable and "resources friendly".
* "all:" searches can be performed via standard github URL parameter "q=all:...". This means that basic top level search box can be used for this kind of searching.

## 0.1
* First published version of extension
* Web workers are used for execution of search queries
* Searching is available via advanced search boxes or via repo search source code box. NOT AVAILABLE in basic top level serach box. 
 


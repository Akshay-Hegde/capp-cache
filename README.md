<div align="center"><img src="https://capriza.github.io/images/logos/logos-cupcake.svg" height="128" /></div>

# Cross Platform Offline Resource Persistency

### Tiny library with zero external dependencies to persist resources (Javascript, css, etc.) for offline
 usage and optimal performance; supports all modern browsers, Safari included. Mobile optimized.

### Usage
In your index.html file, include a script tag with an object describing your resources. 
The script should add an object called `cappCacheManifest` to the window.
The cappCacheManifest structure is:

Property  | description                                                              | type                        | default
----------|--------------------------------------------------------------------------|-----------------------------|-----------------------
resources | An array of resources to be cached. See the following table for details. | array of resource entries   | []
pageId    | An ID of the page under which all resources are cached.                  | string                      | Current page URL

When the page loads, the library will add your resources to the DOM, according to the resources list.
The supported properties for each resource entry are:

Property  | description                                                 | type                 | default
----------|-------------------------------------------------------------|----------------------|-----------
url       | mandatory. The url of the resource from which it is fetched | URL                  |
loadAsync | add "async" property to script elements                     | bool                 | false
type      | type of resource                                            | "script","link","img"| "script"
target    | parent element of the resource                              | "head", "body"       | "head"
cacheOnly | sync the script to the database, but don't append it to the DOM. Use to ensure a resource is in the cache for future use | manifest |

You will need to have your `index.html` file and this library cached in order to allow it to work offline and get the best performance. The easiest way is to create a tiny App Cache manifest to store those two files.
Create a file called `manifest.appcache` with the following content
```
CACHE MANIFEST
_dist/bundle.js
index.html
```
In your `index.html` file add a reference to that file
```html
<html manifest="manifest.appcache">
...
</html>
```
#### Example
```html
<html manifest="manifest.appcache">
<script>
 window.cappCacheResources = {
        resources: [
            {
                url: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js",
                loadAsync: false,
            },
            {
                url: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/locale/ar-ma.js",
            },
        ],
    };
</script>
<script src="dist/capp-cache.js"/>
</html>
```

### Programmatic access
In case you need to dynamically load resources from your Javascript code, use the function `window.cappCache.load(manifest)`.
The function expects a manifest in the same format described above.
For example:
```javascript
setTimeout(() => window.cappCache.load({
		    resources: [
			    {
				    url: "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js",
				    loadAsync: false,
			    },
		    ],
	    }), 1000);
```

It is recommended to remove from the database old scripts. You'll need to manually call `window.cappCache.pruneDB()` after
all the resources were loaded, both at load time and dynamically throughout the life of the application.
The library keeps track of all resources it loaded. When you call this function, all files on the page what were not loaded in this session are removed.

### FAQ

#### Why not just use Service Worker?
Currently SW are not supported on Safari browsers, which is a show stopper for mobile web applications.

#### Why not just use App Cache?
App Cache is considered [deprecated](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache), and for good reasons!
After using App Cache for years, we encountered multiple issues with this technology
* If just one of then resources has changed, App Cache will download everything.
* App Cache manifest has an awkward format with very little control.
* It is very hard to debug and analyze issues with App Cache.
* App Cache doesn't always work, especially on iOS, and you have virtually no way to figure out why. This is based on our extensive experience, with tens of thousands devices in production.
* Whenever a resource is unfetchable, App Cache stops working. This is sometimes a desired behavior, to prevent mix between versions of the code.
  However, in many scenarios there are optional resources (e.g. images), which shouldn't prevent critical resources from loading if they fail to download.

#### Wait! You are recommending to use App Cache to cache index.html and this library, but claim that this library replacec App Cache. What gives?
No. Based on our experience, the issues with App Cache are correlated with the size of App Cache and the frequency of changes. If you just cache just those two files, you shouldn't encounter the issues described above.

#### What's the deal with the name?
This library was developed in [Capriza](https://capriza.github.io/) to replace App Cache. Capriza+AppCache = CappCache. Clever, huh? :)

#### You say tiny library. How tiny?
Less than 2KB gzipped and minifed.

#### Who designed the amazing Cupcake logo?
[Nadav](https://github.com/fujifish). Thanks!

## Todo
- [ ] Main index file is saved in regular app cache
- [ ] If service worker exists - fallback to regular SW?
- [ ] Each page has page id
- [ ] The library should sync the files from the list with the database, including deleting old files
- [ ] File descriptor: {url, type (css, javascript for start)}
- [ ] For starter, no support for versioning is required, we'll just use file names, like CDN
- [ ] Optional resources

## Supported resource types
- [x] Scripts
- [ ] CSS
- [ ] Images

## Longer term todos
- [ ] Use Web Workers for downloading?
- [ ] Add benchmarking

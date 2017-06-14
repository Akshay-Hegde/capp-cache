<div align="center"><img src="https://capriza.github.io/images/logos/logos-cupcake.svg" height="128" /></div>
<div align="center"><div style="font-style: oblique;font-weight: bold; font-size:larger;">The Sweetest Cache Library</div></div>


# Cross Platform Offline Resource Persistency
[<img src="https://travis-ci.org/capriza/capp-cache.svg?branch=master">](https://travis-ci.org/capriza/capp-cache)
![bundle size](http://img.badgesize.io/https://raw.githubusercontent.com/capriza/capp-cache/gh-pages/capp-cache.js?compression=gzip)
### Tiny library with zero external dependencies to persist resources (Javascript, css, etc.) for offline usage and optimal performance; supports all modern browsers, Safari included. Mobile optimized.

Progressive Web Apps (PWA) and offline first apps should be every app's default. Those
 technologies utilize Service Worker APIs and provide amazing experience. _Only_ that it
 leaves all your iOS users [out in the dark](https://jakearchibald.github.io/isserviceworkerready/).
 AppCache is deprecated and limited.
 This library allows convenient Offline First apps for all mobile browsers.
**How does it work?** The library receives a manifest of resources urls (scripts, css), fetches it, add the appropriate DOM tag element, and eventually caches the script in IndexedDB (or fallbacks to localstorage on iOS < v10). On subsequent runs, it fetches those resources immediately, without ever hitting the network. This both significantly increases performance while allowing the app to work without connectivity.     

### Usage
Capp Cache requires a manifest url to load the resources. Add an attribute `data-cc-manifest=<manifest url>` on the HTML tag of your page, referencing your manifest file.
For example: 

```html 
<html data-cc-manifest="capp-cache-manifest.json">
...
</html>
```
The manifest structure is:

Property  | description                                                              | type                        | default
----------|--------------------------------------------------------------------------|-----------------------------|-----------------------
resources | An array of resources to be cached. See the following table for details. | array of resource entries   | []
manifestUrl | A URL from which the manifest JSON is fetched.                         | URL
version   | An identifier for the version of the manifest. A change in this version will result in background syncing of the cache with the new manifest. See function on("manifestUpdated") for details.  | string |


When the page loads, the library will add your resources to the DOM, according to the resources list.
The supported properties for each resource entry are:

Property  | description                                                 | type                 | default
----------|-------------------------------------------------------------|----------------------|-----------
url       | mandatory. The url of the resource from which it is fetched | URL                  |
type      | type of resource. js and css will be added to the DOM unless you specify the cacheOnly flag. blob will only be cached and available in the cache.                                            | "js","css","blob"    | "js"
target    | parent element of the resource                              | "head", "body"       | "head"
attributes| A key / value list of attributes to set on the tag element  | Object               |
cacheOnly | sync the script to the database, but don't append it to the DOM. Use to ensure a resource is in the cache for future use | manifest |

You will need to have your `index.html` file and this library cached in order to allow it to work offline and get optimal performance. The recommended way is to create a tiny App Cache manifest to store those just those two files.
By default, Capp Cache will try to fetch a file called `cappCacheManifest.json`.
You can override this behavior by setting an object property on the `window` object called `cappCacheManifest` before Capp Cache library is loaded.  
To specify a **custom URL** from which cappCache loads the manifest, set `window.cappCacheManifest.manifestUrl` to that URL.
To **inline the manifest**, so that no additional request is triggered, sepcify the `window.cappCacheManifest.resources` array, without specifying `window.cappCacheManifest.manifestUrl`.

---

### Basic Example 
#### index.html
```html
<html manifest="manifest.appcache">
  <head>
    <script src="dist/capp-cache.js"/>
  </head>
  <body>
     ...
  <body/>
</html>
```

#### cappCacheManifest.json   
```json
{
  "version": "1a",
  "resources": [
    {
      "url": "index.css",
      "type": "css"
    },
    {
      "url": "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.0/moment.min.js",
      "attributes": {
        "onload": "console.log('DONE')",
        "async" : true
      }
    }
  ]
}
```

#### manifest.appcache  
Create a file called `manifest.appcache` with the following content

```
CACHE MANIFEST
dist/bundle.js
index.html
```
In your `index.html` file add a reference to that file: `<html manifest="manifest.appcache">`

-----


## API
### `window.cappCache.loadResources(manifest, {syncCacheOnly = false})`
Loads resources according to a manifest object; use this function to load scripts dynamically. The function receives two arguments.  
`manifest` - a manifest object with a `resources` property similar to the `cappCacheManifest.json` file. 
`syncCacheOnly` - if set to `true` files are just cached, but not added to the DOM.
For example:

```javascript
setTimeout(() => window.cappCache.loadResources({
		    resources: [
			    {
				    url: "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js",
				    "attributes": {
				        "async": false
				    }
			    },
		    ],
	    }), 1000);
```
### `window.cappCache.pruneDB()`

From time to time, or after significant change, it is recommended to remove from the database old scripts. Call this function only after all the resources were loaded, both at load time and dynamically throughout the life cycle of the application.
The library keeps track of all resources it has loaded in that session. When you call this function, all files in the cache that were not loaded in this session are removed.

### `window.cappCache.on("manifestUpdated", callback)`
The library caches the `cappCacheManifest.json` and loads all resources accordingly. This saves significant time on startup. However, it has the downside of loading outdated files after a change. If you want to be able to respond to such event, you can register to this event using this function. The callback function will be called with no arguments after the updated manifest is saved to the cache and all resources from that manifest were fetched. For example, you might want to suggest the user to reload the page to see the latest version of the page.  
This feature should be used in conjunction with the `version` property of `cappCacheManifest.json` file. The library will consider an update only if the `version` property is different from the cached manifest. 

### `window.cappCache.getResourceUri({url, isBinary = true})`
Fetches a resource (commonly images and fonts) and returns an object URL. You can use this URI as the source of your resource. For example:

```html
<img id="myImage"/>
<script>
   var uri = window.cappCache.getResourceUri({url: "myImage.png"});
   document.getElementById("myImage").setAttribute("src",uri);
</script>
```
If the resource is textual, set `isBinary` to false. In this case you will receive a [data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) that you can use in a similar way.
```html
<img id="myImage"/>
<script>
   var uri = window.cappCache.getResourceUri({url: "mySVGImage.svg", isBinary: false});
   document.getElementById("myImage").setAttribute("src",uri);
</script>
```

---

### `window.cappCache.revokeResourceUriForUrl(url)`
[Releases](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL) the memory allocated for a resource that was previously assigned using `getResourceUri`. Note that this is only applicable for *binary* resources, that were create the `isBinary : true` flag. While not required, you can use this method to free the memory that was reserved for a resource. Also, note that you need to provide the original url that was used in `getResourceUri`.

### `window.cappCache.setLogLevel(window.cappCache.LOG_LEVELS)`
Sets the console output log level of the library. By default set to warn. 

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
* App Cache only caches files from your domain. e.g. No way to cache Google Analytics script from Google's CDN.    
* Whenever a resource is unfetchable, App Cache stops working. This is sometimes a desired behavior, to prevent mix between versions of the code.  
  However, in many scenarios there are optional resources (e.g. images), which shouldn't prevent critical resources from loading if they fail to download.

#### Wait! You are recommending to use App Cache to cache index.html and this library, but claim that this library replace App Cache. What gives?
No. Based on our experience, the issues with App Cache are correlated with the size of App Cache and the frequency of changes.
If you just cache just those two files, you shouldn't encounter the issues described above.

#### Adding a script tag to my index.html is so 2016. I use a bundler (e.g. Webpack) to pack all my files. Can I just `import` capp-cache?
Yes, but in the naive implementation, this means that the library is added as part of your application bundle. Obviously, Capp Cache has to be loaded before any other script is should load.
If it is part of the code bundle, it can't load that bundle. You can declare a separate entry point for Capp Cache which would result in a separate file.
Then, make sure to load that file first.
For example, in Webpack:

```javascript
entry: {
	CappCache: "capp-cache",
	App: "./index.js"
}
``` 
before other resources and saved

#### What are some of the issues and caveats with this approach?
The root issue is that since the library does not enjoy and special capabilities (unlike Service Worker and App Cache), there are some limitations

- You can't just append script elements in your DOM.   
**Workaround**: you must declare it in a manifest and let CappCache append it to the DOM.
- [DomContentLoaded](https://developer.mozilla.org/en/docs/Web/Events/DOMContentLoaded) is fired before synchronous scripts are loaded.   
**Workaround**: register to the script's `onload` event in the cappCacheManifest. For example:

```javascript
{
  "url": "my-script.js",
  "attributes": {
    "onload": "console.log('script loaded')"
   }
}
``` 
- Secondary resources that are declared by your app need to use CappCache as well. For example, font `src` declared in your CSS file.   
**Workaround**: one option is to inline the resource as base64 encoded [data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs). There are [online](https://dopiaza.org/tools/datauri/index.php) tools for that, or you can use a bundler such as Webpack [url-loader](https://github.com/webpack-contrib/url-loader)
- [Code splitting](https://webpack.js.org/guides/code-splitting-async/) does not take advantage of caching and offline.   
**workaround**: in your bundler configuration, define a separate entry point for the code that should be loaded later. When the application needs to load that chunk, use CappCache `loadResource` function. 
- Flash of unstyled content ([FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content)) - When the page loads, you see unstyled HTML elements. This happens because the CSS is loaded dynamically using Javascript. The browser thinks that there is no CSS for the elements and displays the elements without styling.   
**workaround**:
Hide the 

```html
<head>
   <style>
   .capp-cache {
      display: none;
   }
   </style>
...
</head>
<body class="capp-cache">
...
</body>
```
Then, include in your CSS file an override:

```css
body.capp-cache {
   display: initial;
}
```
Another option is to include the critical CSS inline as `<style>` element in the HTML file.

#### What's the deal with the name?
This library was developed in [Capriza](https://capriza.github.io/) to replace App Cache. Capriza+AppCache = CappCache. Clever, huh? :)

#### You say tiny library. How tiny?
![bundle size](http://img.badgesize.io/https://raw.githubusercontent.com/capriza/capp-cache/gh-pages/capp-cache.js?compression=gzip)

#### Who designed the amazing Cupcake logo?
[Nadav](https://github.com/fujifish). Thanks!

## Todo
- [ ] Local storage fallback
- [ ] If service worker exists - fallback to regular SW?
- [ ] Allow to invalidate file
- [ ] Optional resources

## Longer term todos
- [ ] Use Web Workers for downloading?
- [ ] Add benchmarking

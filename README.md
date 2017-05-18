# App cache replacement

## This is a WIP. Check back again soon :)

### Tiny library with zero external dependencies to replace AppCache for all browsers modern, including Safari.
This library aims to address the need to cache resources to support offline applications and improve performance,
especially on mobile devices.

### Usage
Include ... 

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

#### Isn't having the index.html and this library in App Cache defies the purpose of this library
No. Based on our experience, the issues with App Cache are correlated with the size of App Cache and the frequency of changes. If you just cache just those two files, you shouldn't encounter the issues described above.

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

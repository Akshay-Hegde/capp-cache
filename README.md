# App cache replacement

## This is a WIP. Check back again soon :)

### Tiny library with zero dependencies to replace AppCache for all browsers modern, including Safari.

This library aims to address the need to cache resources to support offline applications and improve performance,
especially on mobile devices.

### FAQ

#### Why not just use Service Worker?
Currently SW are not supported on Safari browsers, which is a show stopper for mobile web applications.

#### Why not just use App Cache?
App Cache is considered [deprecated](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache), and for good reasons!
After using App Cache for years, we encountered multiple issues with this technology
* All or nothing mechanism - if you just one of your resources has changed, App Cache will download everything again
* App Cache manifest has an awkward format with very little control over fetching
* It is very hard to debug and analyze issues with App Cache
* App Cache doesn't always work, and you have virtually no way to figure out why. This is based on our extensive experience, in production.
* Whenever a resource is unfetchable, App Cache stops working. This is sometimes a desired behavior, to prevent mix between versions of the code.
  However, in many scenarios there are optional resources (e.g. images), which shouldn't prevent critical resources from loading if they fail to download.


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
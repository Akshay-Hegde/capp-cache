# App cache replacement

## This is a WIP. Check back again soon :)

Tiny library to replace AppCache for all browsers modern, including Safari.

## Todo
- [ ] Main index file is saved in regular app cache
- [ ] If service worker exists - fallback to regular SW?
- [ ] Each page has page id
- [ ] The library should sync the files from the list with the database, including deleting old files
- [ ] File descriptor: {url, type (css, javascript for start), versionId}
- [ ] For starter, no support for versioning is required, we'll just use file names, like CDN
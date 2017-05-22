import { load, pruneDB } from "./src/resourceLoader";

(function init() {
    const manifest = window.cappCacheResources || { resources: [] };
    const pageId = manifest.pageId || window.location;
    load({ manifest, pageId, indexedDB: window.indexedDB });
    window.cappCache = {
        load,
        pruneDB,
    };
})();

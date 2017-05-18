import { load, pruneDB } from "./src/resourceLoader";

(function init() {
    const manifest = window.cappCacheResources || { resources: [] };
    load(manifest);
    window.cappCache = {
        load,
        pruneDB,
    };
})();

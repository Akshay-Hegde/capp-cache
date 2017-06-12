import { LOG_LEVELS, setLogLevel } from "./src/logger";
import { load, pruneDB, getResourceUri, revokeResourceUriForUrl, getLoadedResources } from "./src/resourceManager";
import { on, trigger } from "./src/eventBus";
import manifestManager from "./src/manifestManager";

(function init() {
    const manifestUrl = document.getElementsByTagName("html")[0].dataset.ccManifest;
    if (manifestUrl !== undefined) {
        manifestManager.fetchManifest(manifestUrl).then(({ manifest, wasModified }) => {
            if (wasModified) {
                load(manifest, { syncCacheOnly: true }).then(() => trigger("manifestUpdated"));
            }
        });
    } else {
        console.error(`Unable to find attribute "data-cc-manifest" on the HTML tag, CappCache will not work`);
    }
    window.cappCache = {
        loadResources(manifest, opts) {
            load(manifest, opts);
        },
        getResourceUri,
        revokeResourceUriForUrl,
        pruneDB,
        on,
        getLoadedResources,
        setLogLevel,
        LOG_LEVELS,
    };
})();

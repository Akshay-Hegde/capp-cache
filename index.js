import { load, pruneDB, getResourceUri, revokeResourceUriForUrl } from "./src/resourceManager";
import { on, trigger } from "./src/eventBus";
import manifestManager from "./src/manifestManager";

(function init() {
    let manifest = window.cappCacheManifest;
    if (manifest === undefined) {
        manifest = { manifestUrl: "./cappCacheManifest.json" };
    }
    if (manifest.manifestUrl !== undefined) {
        manifestManager.fetchManifest(manifest.manifestUrl).then(({ manifest, wasModified }) => {
            if (wasModified) {
                load(manifest, {syncCacheOnly: true}).then(() => trigger("manifestUpdated"));
            }
        });
    } else {
        //inline manifest
        load({ manifest });
    }
    window.cappCache = {
        loadResources(manifest, opts) {
	        load(manifest, opts);
        },
        getResourceUri,
	    revokeResourceUriForUrl,
        pruneDB,
        on,
    };
})();

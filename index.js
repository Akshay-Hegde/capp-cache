import { load, pruneDB } from "./src/resourceManager";
import manifestManager from "./src/manifestManager";

(function init() {
	window.cappCache = {
		load,
		pruneDB,
	};

	let manifest = window.cappCacheManifest;
	if (manifest === undefined) {
	    manifest = { manifestUrl: 'cappCacheManifest.json' };
    }
	if (manifest.manifestUrl !== undefined) {
	    manifestManager.fetchManifest(manifest.manifestUrl);
    } else { //inline manifest
	    const pageId = manifest.pageId || window.location.href;
	    load({ manifest, pageId, indexedDB: window.indexedDB });
    }
})();

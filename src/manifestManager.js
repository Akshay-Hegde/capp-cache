import { loadResource, fetchAndSaveInCache } from "./resourceLoader";
import { load } from "./resourceManager";
import indexedDBAccess from "./indexedDBAccess";

export default {
    fetchManifest(manifestUrl, pageId = window.location.href, indexedDB = window.indexedDB) {
        return new Promise((resolve, reject) => {
            indexedDBAccess(pageId, indexedDB).then(db => {
                loadResource(db, manifestUrl, true)
                    .then(opts => {
                        const manifestContent = opts.resource;
                        const manifest = JSON.parse(manifestContent);
                        load(manifest);
                        if (opts.fromCache) {
                            fetchAndSaveInCache(manifestUrl, db).then(newManifestContent => {
                                const newManifest = JSON.parse(newManifestContent);
                                if (newManifest.version !== manifest.version) {
                                    console.log(
                                        `new app cache version has changed from "${manifest.version}" to "${newManifest.version}"`
                                    );
                                    resolve({ manifest: newManifest, wasModified: true });
                                } else {
                                    resolve({ manifest: newManifest, wasModified: false });
                                }
                            });
                        } else {
                            //from network
                            resolve({ manifest: manifest, wasModified: false });
                        }
                    })
                    .catch(err => {
                        console.error(`failed to fetch manifest ${err}`);
                    });
            });
        });
    },
};

import { log, error } from "./logger";
import { loadResource, fetchAndSaveInCache } from "./resourceLoader";
import { load } from "./resourceManager";
import indexedDBAccess from "./indexedDBAccess";

export default {
  fetchManifest(manifestUrl, indexedDB = window.indexedDB) {
    return new Promise((resolve, reject) => {
      indexedDBAccess(indexedDB).then(db => {
        loadResource({ indexedDBAccess: db, url: manifestUrl, immediate: true })
          .then(({ fromCache, resource }) => {
            const manifestContent = resource.content;
            const manifest = JSON.parse(manifestContent);
            load(manifest);
            let wasModified = false;
            if (fromCache) {
              fetchAndSaveInCache({ url: manifestUrl, indexedDBAccess: db }).then(newManifestContent => {
                const newManifest = JSON.parse(newManifestContent.content);
                if (newManifest.version !== manifest.version) {
                  log(`new app cache version has changed from "${manifest.version}" to "${newManifest.version}"`);
                  wasModified = true;
                }
                resolve({ manifest: newManifest, wasModified });
              });
            } else {
              //from network
              resolve({ manifest: manifest, wasModified });
            }
          })
          .catch(err => {
            error(`failed to fetch manifest ${err}`);
            reject(err);
          });
      });
    });
  },
};

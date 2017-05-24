import { loadResource } from "./resourceLoader";
import { load } from "./resourceManager";
import indexedDBAccess from './indexedDBAccess';

export default {
    fetchManifest(manifestUrl, pageId = window.location.href, indexedDB = window.indexedDB) {
        indexedDBAccess(pageId, indexedDB).then(db => {
            loadResource(db, manifestUrl, true)
                .then(manifestContent => {
	                const manifest = JSON.parse(manifestContent);
                    load(manifest);
                })
                .catch(err => {
                    console.error(`failed to fetch manifest ${err}`);
                });
        });
    },
};

import indexedDBAccess from "./indexedDBAccess";
import tagPropertiesMap from "./tagPropertiesMap";
import { loadResource, getCachedFiles } from "./resourceLoader";

// We use this mock document when loading assets with "cacheOnly" property. this keeps code consistent (no "if cacheOnly... else... ),
// while avoiding performance hit of adding unnecessary elements to the DOM when we just want to pre-cache the elements
const MOCK_DOCUMENT = {
    createElement: () => ({
        appendChild: Function.prototype,
        setAttribute: Function.prototype,
    }),
    head: { appendChild: Function.prototype },
    body: { appendChild: Function.prototype },
    createTextNode: Function.prototype,
};

/**
 * Loads a list of resources according to the manifest.
 * */
export function load(
    { resources = [], pageId = window.location.href, indexedDB = window.indexedDB },
    syncCacheOnly = false
) {
    return new Promise((resolve, reject) => {
        indexedDBAccess(pageId, indexedDB).then(db => {
            const orderedResources = resources.filter(r => !r.cacheOnly).concat(resources.filter(r => r.cacheOnly));
            let lastErr = undefined;
            orderedResources.forEach(({
                url,
                type = "script",
                target = "head",
                attributes = {},
                loadAsync = false,
                cacheOnly = false,
            }, index) => {
                const tagProperties = tagPropertiesMap[type];
                const documentTarget = cacheOnly || syncCacheOnly ? MOCK_DOCUMENT : document;
                let tag = documentTarget.createElement(tagProperties.tagName);
                loadResource(db, url, false)
                    .then(({ resource }) => {
                        if (type === "script") {
                            resource = `//# sourceURL=${url}\n${resource}`;
                        }
                        tagProperties.appendTextContent(tag, documentTarget, resource);
                        tag.setAttribute("data-cappcache-src", url);
                    })
                    .catch(() => {
                        if (tagProperties.tagNameWhenNotInline !== undefined) {
                            tag = documentTarget.createElement(tagProperties.tagNameWhenNotInline);
                            tagProperties.attributes = tagProperties.attributesWhenNotInline;
                        }
                        tag.setAttribute(tagProperties.contentFetchKey, url);
                    })
                    .then(() => {
                        if (loadAsync && type === "script") {
                            tag.setAttribute("async", "async");
                        }
                        Object.keys(attributes).forEach(attribute =>
                            tag.setAttribute(attribute, attributes[attribute]));
                        Object.keys(tagProperties.attributes).forEach(attribute =>
                            tag.setAttribute(attribute, tagProperties.attributes[attribute]));
                        documentTarget[target].appendChild(tag);
                    })
                    .catch(err => {
                        lastErr = err;
                    })
                    .then(() => {
                        if (index === orderedResources.length) {
                            lastErr === undefined ? resolve() : reject(lastErr);
                        }
                    });
            });
        });
    });
}

/**
 * Clears indexedDB from any files on this page which were not loaded in this session by calling the load function.
 * Call this function to remove old obsolete files from the cache.
 */
export function pruneDB(pageId = window.location.href, indexedDB = window.indexedDB) {
    indexedDBAccess(pageId, indexedDB).then(db => {
        db.pruneDb(getCachedFiles());
    });
}

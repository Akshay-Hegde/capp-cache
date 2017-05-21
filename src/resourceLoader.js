import idbAccess from "./indexedDBAccess";
import { id } from "./id";
import { fetchImage } from "./network";
import tagPropertiesMap from "./tagPropertiesMap";

const RESOURCE_FETCH_DELAY = 1000;
let cachedFilesInSession = [];

const scheduleResourceCache = (url, db) => {
    fetchImage(url).then(content => {
        db.putResource(id(url), content);
    });
};

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
export function load(manifest) {
    idbAccess(window.location).then(db => {
        const { resources } = manifest;
        // resources.push({ url: "measure.js", loadAsync: true });

        const orderedResources = resources
            .filter(r => !r.cacheOnly)
            .concat(resources.filter(r => r.cacheOnly));

        //todo: make async!
        orderedResources.forEach(({
            url,
            type = "script",
            target = "head",
            loadAsync = false,
            cacheOnly = false,
        }) => {
            const tagProperties = tagPropertiesMap[type];
            const documentTarget = cacheOnly ? MOCK_DOCUMENT : document;
            const tag = documentTarget.createElement(tagProperties.tagName);
            db
                .getResource(id(url))
                .then(resource => {
                    console.log(`resource ${url} was in cache`);
                    tagProperties.appendTextContent(
                        tag,
                        documentTarget,
                        resource
                    );
                })
                .catch(err => {
                    console.log(
                        err
                            ? `failed to fetch resource from cache ${url}. error: ${err}`
                            : `resource ${url} was not in cache`
                    );
                    tag.setAttribute(tagProperties.contentFetchKey, url);
                    setTimeout(
                        () => scheduleResourceCache(url, db),
                        RESOURCE_FETCH_DELAY
                    );
                })
                .then(() => {
                    if (loadAsync && type === "script") {
                        tag.setAttribute("async", "async");
                    }
                    Object.keys(tagProperties.props).forEach(prop =>
                        tag.setAttribute(prop, tagProperties.props[prop]));
                    documentTarget[target].appendChild(tag);
                });
        });

        const cachedResources = resources.map(resource => id(resource.url));
        cachedFilesInSession = cachedFilesInSession.concat(cachedResources);
    });
}

/**
 * Clears indexedDB from any files on this page which were not loaded in this session by calling the load function.
 * Call this function to remove old obsolete files from the cache.
 */
export function pruneDB() {
    idbAccess(window.location).then(db => {
        db.pruneDb(cachedFilesInSession);
    });
}

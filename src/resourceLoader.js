import idbAccess from "./indexedDBAccess";
import { id } from "./id";
import { fetchImage } from "./network";

const RESOURCE_FETCH_DELAY = 1000;
let cachedFilesInSession = [];

const scheduleResourceCache = (url, db) => {
    fetchImage(url).then(content => {
        db.putResource(id(url), content);
    });
};



/**
 * Loads a list of resources according to the manifest.
 * */
export function load(manifest) {
    idbAccess(window.location).then(db => {

        let { resources } = manifest;
        // resources.push({ url: "measure.js", loadAsync: true });

        //todo: make async!
        resources.forEach(({
            url,
            type = "script",
            target = "head",
            loadAsync = true,
        }) => {
            const tag = document.createElement(type);
            db
                .getResource(id(url))
                .then(resource => {
                    console.log(`resource ${url} was in cache`);
                    tag.appendChild(document.createTextNode(resource));
                })
                .catch(err => {
                    console.log(
                        err
                            ? `failed to fetch resource from cache ${url}. error: ${err}`
                            : `resource ${url} was not in cache`
                    );
                    tag.setAttribute("src", url);
                    setTimeout(
                        () => scheduleResourceCache(url, db),
                        RESOURCE_FETCH_DELAY
                    );
                })
                .then(() => {
                    if (loadAsync) {
                        tag.setAttribute("async", "async");
                    }
                    document[target].appendChild(tag);
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

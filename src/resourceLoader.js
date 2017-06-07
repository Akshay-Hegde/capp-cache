import { id } from "./id";
import { fetchResource } from "./network";

let RESOURCE_FETCH_DELAY = 1000;
let cachedFilesInSession = {};

export const fetchAndSaveInCache = (url, indexedDBAccess) =>
    new Promise((resolve, reject) => {
        fetchResource(url)
            .then(result => {
                resolve(result);
                indexedDBAccess.putResource(id(url), result);
            })
            .catch(e => {
                reject(e);
            });
    });

export const loadResource = (indexedDBAccess, resourceUrl, immediate = false) => {
    const promise = new Promise((resolve, reject) => {
        indexedDBAccess
            .getResource(id(resourceUrl))
            .then(resource => {
                console.log(`resource ${resourceUrl} was in cache`);
                resolve({ resource, fromCache: true });
            })
            .catch(err => {
                console.log(
                    err
                        ? `failed to fetch resource from cache ${resourceUrl}. error: ${err}`
                        : `resource ${resourceUrl} was not in cache`
                );
                if (immediate) {
                    fetchAndSaveInCache(resourceUrl, indexedDBAccess)
                        .then(resource => resolve({ resource, fromCache: false }))
                        .catch(err => reject(err));
                } else {
                    window.setTimeout(() => fetchAndSaveInCache(resourceUrl, indexedDBAccess), RESOURCE_FETCH_DELAY);
                    reject(null);
                }
            });
    });
    cachedFilesInSession[id(resourceUrl)] = true;
    return promise;
};

export const getCachedFiles = () => Object.keys(cachedFilesInSession);

import { id } from "./id";
import { fetchResource } from "./network";

const RESOURCE_FETCH_DELAY = 1000;
let cachedFilesInSession = [];
let _fetchResource = fetchResource;

export const fetchAndSaveInCache = (url, indexedDBAccess) =>
    new Promise((resolve, reject) => {
        _fetchResource(url)
            .then(content => {
                resolve(content);
                indexedDBAccess.putResource(id(url), content);
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
                        .then(content => resolve({ resource: content, fromCache: false }))
                        .catch(err => reject(err));
                } else {
                    setTimeout(() => fetchAndSaveInCache(resourceUrl, indexedDBAccess), RESOURCE_FETCH_DELAY);
                    reject(null);
                }
            });
    });
    cachedFilesInSession.push(id(resourceUrl));
    return promise;
};

export const getCachedFiles = () => [...cachedFilesInSession];

/** Testing only **/
export const __injectNetworkMock__ = mockNetwork => _fetchResource = mockNetwork;

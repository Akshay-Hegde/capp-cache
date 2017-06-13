import { log, error } from "./logger";
import { id } from "./id";
import { fetchResource } from "./network";

let RESOURCE_FETCH_DELAY = 1000;
let cachedFilesInSession = {};

export const fetchAndSaveInCache = ({ url, indexedDBAccess, isBinary }) =>
  new Promise((resolve, reject) => {
    log(`fetching resource ${url} to cache`);
    fetchResource(url, isBinary ? "blob" : undefined)
      .then(result => {
        log(`successfully fetched resource ${url} to cache`);
        resolve(result);
        indexedDBAccess.putResource(id(url), result);
      })
      .catch(e => {
        reject(e);
      });
  });

export const loadResource = ({ indexedDBAccess, url, immediate = false, isBinary = false }) => {
  const promise = new Promise((resolve, reject) => {
    indexedDBAccess
      .getResource(id(url))
      .then(resource => {
        log(`resource ${url} was in cache`);
        resolve({ resource, fromCache: true });
      })
      .catch(err => {
        log(err ? `failed to fetch resource from cache ${url}. error: ${err}` : `resource ${url} was not in cache`);
        if (immediate) {
          fetchAndSaveInCache({ url, indexedDBAccess, isBinary })
            .then(resource => resolve({ resource, fromCache: false }))
            .catch(err => reject(err));
        } else {
          window.setTimeout(() => fetchAndSaveInCache({ url, indexedDBAccess, isBinary }), RESOURCE_FETCH_DELAY);
          reject(null);
        }
      });
  });
  cachedFilesInSession[id(url)] = true;
  return promise;
};

export const getCachedFiles = () => Object.keys(cachedFilesInSession);

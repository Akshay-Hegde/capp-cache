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
  const fullUrl = id(url);
  const promise = new Promise((resolve, reject) => {
    indexedDBAccess
      .getResource(fullUrl)
      .then(resource => {
        log(`resource ${fullUrl} was in cache`);
        resolve({ resource, fromCache: true });
      })
      .catch(err => {
        log(
          err ? `failed to fetch resource from cache ${fullUrl}. error: ${err}` : `resource ${fullUrl} was not in cache`
        );
        if (immediate) {
          fetchAndSaveInCache({ url: fullUrl, indexedDBAccess, isBinary })
            .then(resource => resolve({ resource, fromCache: false }))
            .catch(err => reject(err));
        } else {
          window.setTimeout(
            () => fetchAndSaveInCache({ url: fullUrl, indexedDBAccess, isBinary }),
            RESOURCE_FETCH_DELAY
          );
          reject(null);
        }
      });
  });
  cachedFilesInSession[fullUrl] = true;
  return promise;
};

export const getCachedFiles = () => Object.keys(cachedFilesInSession);

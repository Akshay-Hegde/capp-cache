import { log, error, perfMark, perfMarkEnd } from "./logger";
import { id } from "./id";
import { fetchResource } from "./network";

let RESOURCE_FETCH_DELAY = 1000;
let cachedFilesInSession = {};

export const fetchAndSaveInCache = ({ url, indexedDBAccess, isBinary }) =>
  new Promise((resolve, reject) => {
    log(`fetching resource ${url} to cache ${isBinary ? "as binary" : ""}`);
    fetchResource(url, isBinary ? "blob" : undefined)
      .then(result => {
        log(`successfully fetched resource ${url} to cache`);
        resolve(result);
        indexedDBAccess.put(id(url), result);
      })
      .catch(e => {
        error(`failed to fetch resource ${url} from the web with error ${e.status}: ${e.statusText}`);
        reject(e);
      });
  });

export const loadResource = ({ indexedDBAccess, url, immediate = false, isBinary = false, cacheOnly = false }) => {
  perfMark(`loadResource ${url} start`);
  const fullUrl = id(url);
  const method = cacheOnly ? "exists" : "get";
  const promise = new Promise((resolve, reject) => {
    indexedDBAccess
      [method](fullUrl)
      .then(resource => {
        log(`resource ${fullUrl} was in cache`);
        resolve({ resource, fromCache: true });
        perfMarkEnd(`loadResource ${url}${cacheOnly ? " (cache only)" : ""}`, `loadResource ${url} start`);
      })
      .catch(err => {
        if (err) {
          error(`failed to fetch resource from cache ${fullUrl}. error: ${err}`);
          return reject(err);
        } else {
          log(`resource ${fullUrl} was not in cache`);
        }
        if (immediate) {
          fetchAndSaveInCache({ url: fullUrl, indexedDBAccess, isBinary })
            .then(resource => resolve({ resource, fromCache: false }))
            .catch(err => reject(err));
        } else {
          window.setTimeout(
            () =>
              fetchAndSaveInCache({ url: fullUrl, indexedDBAccess, isBinary }).catch(err => {
                /*do nothing*/
              }),
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

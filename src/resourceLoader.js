import { log, error, perfMark, perfMarkEnd } from "./cappCacheLogger";
import { id } from "./id";
import { fetchResource } from "./network";
import { FAILED_TO_OPEN_IDB } from "./indexedDBAccess";

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

export const loadResource = ({
  indexedDBAccess,
  url,
  immediate = false,
  isBinary = false,
  cacheOnly = false,
  forceRecaching = false,
  networkOnly = false,
}) => {
  perfMark(`loadResource ${url} start`);
  const fullUrl = id(url);
  let method = "get";
  if (forceRecaching) {
    method = "skip";
  } else if (cacheOnly) {
    method = "exists";
  }
  const promise = new Promise((resolve, reject) => {
    if (networkOnly) {
      return reject(null);
    }
    indexedDBAccess
      [method](fullUrl)
      .then(resource => {
        log(`resource ${fullUrl} was in cache`);
        resolve({ resource, fromCache: true });
        perfMarkEnd(`loadResource ${url}${cacheOnly ? " (cache only)" : ""}`, `loadResource ${url} start`);
      })
      .catch(err => {
        if (err && err !== FAILED_TO_OPEN_IDB) {
          error(
            `${forceRecaching ? "re-caching resource" : "failed to fetch resource from cache"} ${fullUrl}.${err
              ? " error" + err
              : ""}`
          );
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

import { log, error, perfMark, perfMarkEnd } from "./logger";
import { id } from "./id";
import { fetchAndSaveInCache } from "./fetchToCache";
import Worker from './Worker';
import actions from "./workerActions";

let cachedFilesInSession = {};

const KILL_WORKER_AFTER_IDLE = 5000;
let worker;
let workerDieTimeout = null;

const callbackMap = {};

function getWorker(url, resolve, reject) {
  callbackMap[url] = { resolve, reject };
  if (worker) {
    return worker;
  } else {
    worker = new Worker("fetch-worker.js");
    worker.onmessage = function(e) {
      const { url, error } = e.data.payload;
      const { action, success } = e.data;
      log(`[Fetch Worker] ${action} url: ${url || "N/A"}${error ? "\n" + JSON.stringify(error) : ""}`);
      const callbacks = callbackMap[url];
      if (callbacks) {
        success ? callbacks.resolve() : callbacks.reject();
        console.log(`deleting for ${url}`);
        callbackMap[url] = null;
      }
    };
  }
  if (workerDieTimeout) {
    clearTimeout(workerDieTimeout);
  }
  workerDieTimeout = setTimeout(() => {
    worker.postMessage({ action: actions.CLOSE });
    worker = null;
    workerDieTimeout = null;
  }, KILL_WORKER_AFTER_IDLE);
  return worker;
}

function scheduleBackgroundFetch({ url, isBinary }) {
  return new Promise((resolve, reject) => {
    worker = getWorker(url, resolve, reject);
    worker.postMessage({
      action: actions.FETCH,
      payload: {
        url,
        isBinary,
      },
    });
  });
}

export const loadResource = ({ indexedDBAccess, url, immediate = false, isBinary = false, cacheOnly = false }) => {
  const startMarker = `loadResource ${url} start`;
  perfMark(startMarker);
  const fullUrl = id(url);
  const method = cacheOnly ? "exists" : "get";
  const promise = new Promise((resolve, reject) => {
    indexedDBAccess
      [method](fullUrl)
      .then(resource => {
        log(`resource ${fullUrl} was in cache`);
        resolve({ resource, fromCache: true });
        perfMarkEnd(`loadResource ${url}${cacheOnly ? " (cache only)" : ""}`, startMarker);
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
          scheduleBackgroundFetch({ url: fullUrl, isBinary }).catch(err => {
            /*do nothing*/
          });
          reject(null);
        }
      });
  });
  cachedFilesInSession[fullUrl] = true;
  return promise;
};

export const getCachedFiles = () => Object.keys(cachedFilesInSession);

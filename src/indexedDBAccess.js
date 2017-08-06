import { log, error } from "./cappCacheLogger";
import indexedDB from "./indexedDB";

const DB_NAME = "RESOURCE_CACHE";
const STORE_NAME = "RESOURCES";
export const FAILED_TO_OPEN_IDB = "FAILED_TO_OPEN_IDB";
const DB_VERSION = 4;

let resolvedPromise = null;

export default function() {
  if (resolvedPromise) {
    return resolvedPromise;
  }
  let dbOpenFailed = false;
  const idbWrapper = Object.create(null);
  let _db = null;
  const req = indexedDB.open(DB_NAME, DB_VERSION);

  const store = (type = "readwrite") => {
    const transaction = _db.transaction([STORE_NAME], type);
    return transaction.objectStore(STORE_NAME);
  };

  idbWrapper.get = id =>
    new Promise((resolve, reject) => {
      if (dbOpenFailed) {
        return reject(FAILED_TO_OPEN_IDB);
      }
      const request = store("readonly").get(id);
      request.onsuccess = event => {
        if (event.target.result) {
          resolve(event.target.result);
        } else {
          log(`resource with id ${id} is not in the cache`);
          reject(null);
        }
      };
      request.onerror = event => {
        reject(event);
      };
    });

  idbWrapper.skip = () => Promise.reject();

  idbWrapper.exists = id =>
    new Promise((resolve, reject) => {
      if (dbOpenFailed) {
        return reject(FAILED_TO_OPEN_IDB);
      }
      const request = store("readonly").count(id);
      request.onsuccess = e => {
        const exists = e.target.result > 0;
        if (exists) {
          resolve({});
        } else {
          reject();
        }
      };
      request.onerror = event => {
        reject(event);
      };
    });

  idbWrapper.removeResource = id =>
    new Promise((resolve, reject) => {
      if (dbOpenFailed) {
        return reject(FAILED_TO_OPEN_IDB);
      }
      const objectStore = store();
      const request = objectStore.delete(id);
      request.onsuccess = () => {
        log(`removed resource ${id}`);
        resolve();
      };
      request.onerror = e => {
        error(`failed to remove resource ${id}. error: ${e}`);
        reject(e);
      };
    });

  idbWrapper.put = (id, { content, contentType }) =>
    new Promise((resolve, reject) => {
      if (dbOpenFailed) {
        return reject(FAILED_TO_OPEN_IDB);
      }
      const objectStore = store();
      const putRequest = objectStore.put({
        id,
        content,
        contentType,
      });

      putRequest.onsuccess = resolve;
      putRequest.onerror = e => {
        error(`failed to save item with id ${id} in cache due to error ${e}`);
        reject();
      };
    });

  idbWrapper.pruneDb = (knownIds = []) =>
    new Promise((resolve, reject) => {
      if (dbOpenFailed) {
        return reject(FAILED_TO_OPEN_IDB);
      }
      const objectStore = store();
      const request = objectStore.openCursor();
      request.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
          if (!knownIds.includes(cursor.key)) {
            idbWrapper.removeResource(cursor.key);
            log(`pruned ${cursor.key}`);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = e => {
        error(`failed to get all keys while pruning cache. error`);
        reject(e);
      };
    });

  resolvedPromise = new Promise((resolve, reject) => {
    req.onsuccess = e => {
      _db = e.target.result;
      resolve(idbWrapper);
    };
    req.onupgradeneeded = e => {
      const db = e.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    req.onerror = e => {
      dbOpenFailed = true;
      error("failed to open indexedDB " + JSON.stringify(e));
      resolve(idbWrapper);
    };
  });
  return resolvedPromise;
}

export const closeConnection = () => {
  resolvedPromise = null;
};

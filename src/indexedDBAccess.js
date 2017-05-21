const DB_NAME = "RESOURCE_CACHE";
const DB_VERSION = 3;

const verboseOutput = false;

export default function(storeName, indexedDB) {
    const idbWrapper = Object.create(null);
    let _db = null;
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    const store = (type = "readwrite") => {
        //todo: create object store when first in the page?
        const transaction = _db.transaction([storeName], type);
        return transaction.objectStore(storeName);
    };

    idbWrapper.getResource = id =>
        new Promise((resolve, reject) => {
            const request = store("readonly").get(id);
            request.onsuccess = event => {
                if (event.target.result) {
                    resolve(event.target.result.content);
                } else {
                    console.log(`resource with id ${id} is not in the cache`);
                    reject(null);
                }
            };
            request.onerror = event => {
                reject(event);
            };
        });

    idbWrapper.removeResource = id =>
        new Promise((resolve, reject) => {
            const objectStore = store();
            const request = objectStore.delete(id);
            request.onsuccess = () => {
                console.log(`removed resource ${id}`);
                resolve();
            };
            request.onerror = e => {
                console.error(`failed to remove resource ${id}. error: ${e}`);
                reject(e);
            };
        });

    idbWrapper.putResource = (id, content) =>
        new Promise((resolve, reject) => {
            const objectStore = store();
            const putRequest = objectStore.put({
                id,
                content,
            });

            putRequest.onsuccess = () => {
                if (verboseOutput) {
                    console.log(`successfully saved item id ${id} in cache`);
                }
                resolve();
            };
            putRequest.onerror = e => {
                console.error(`failed to save item with id ${id} in cache due to error ${e}`);
                reject();
            };
        });

    idbWrapper.pruneDb = ids =>
        new Promise((resolve, reject) => {
            const objectStore = store();
            const request = objectStore.openCursor();
            request.onsuccess = e => {
                const cursor = e.target.result;
                if (cursor) {
                    if (!ids.includes(cursor.key)) {
                        idbWrapper.removeResource(cursor.key);
                        console.log(`pruned ${cursor.key}`);
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = e => {
                console.error(`failed to get all keys while pruning cache. error`);
                reject(e);
            };
        });

    return new Promise((resolve, reject) => {
        req.onsuccess = e => {
            _db = e.target.result;
            resolve(idbWrapper);
        };
        req.onupgradeneeded = e => {
            const db = e.target.result;
            if (e.oldVersion > 0) {
                try {
                    db.deleteObjectStore(storeName);
                } catch (e) {
                    console.log(
                        `exception when trying to delete object store during onupgradeneeded. ${JSON.stringify(e)}`
                    );
                }
            }
            db.createObjectStore(storeName, { keyPath: "id" });
        };
        req.onerror = e => {
            console.error("failed to open indexedDB " + JSON.stringify(e));
            reject(e);
        };
    });
}

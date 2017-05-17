const DB_NAME = "RESOURCE_CACHE";
const DB_VERSION = 3;

const verboseOutput = false;

export default function(storeName) {
    const idbWrapper = Object.create(null);
    let _db = null;
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

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
            objectStore.delete(id);
            objectStore.onsuccess = () => {
                console.log(`removed resource ${id}`);
                resolve();
            };
            objectStore.onerror = e => {
                console.error(`failed to remove resource ${id}. error: ${e}`);
                reject(e);
            };
        });

    idbWrapper.putResource = (id, content) =>
        new Promise((resolve, reject) => {
            const objectStore = store();
            const putRequest = objectStore.put({
                id,
                content
            });
            if (verboseOutput) {
                putRequest.onsuccess = () => {
                    console.log(`successfully saved item id ${id} in cache`);
                    resolve();
                };
            }
            putRequest.onerror = e => {
                console.error(
                    `failed to save item with id ${id} in cache due to error ${e}`
                );
                reject();
            };
        });

    idbWrapper.pruneDb = ids =>
        new Promise((resolve, reject) => {
            const objectStore = store();
            const request = objectStore.openCursor();
            request.onsuccess = e => {
                const cursor = event.target.result;
                if (cursor) {
                    if (!ids.includes(cursor.key)) {
                        idbWrapper.removeResource(cursor.key);
                    }
                    cursor.continue();
                }
            };
            request.onerror = e => {
                console.error(
                    `failed to get all keys while pruning cache. error`
                );
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

/*

class DB {
    /!*store(type = "readwrite") {
        const transaction = this._db.transaction([storeName], type);
        return transaction.objectStore(storeName);
    }*!/

    getResources(info, fillCacheHandler) {
        const resultPromises = {};
        const objectStore = this.store("readonly");
        info.forEach(({ icon_url, id }) => {
            const idResult = objectStore.get(icon_url);
            resultPromises[id] = new Promise((resolve, reject) => {
                idResult.onsuccess = event => {
                    if (event.target.result) {
                        resolve(event.target.result.content);
                        verboseOutput &&
                            console.log(
                                `successfully fetched ${icon_url} for zapp ${id} from cache, result size is ${event.target.result.content.length}`
                            );

                        //update access timestamp
                        event.target.result.accessedOn = new Date();
                        const objectStore = this.store();
                        const putRequest = objectStore.put(event.target.result);
                        if (verboseOutput)
                            putRequest.onsuccess = () =>
                                console.log(
                                    `successfully updated timestamp of ${icon_url} for zapp ${id} in cache`
                                );
                        putRequest.onerror = e =>
                            console.error(
                                `failed to update timestamp of ${icon_url} for zapp ${id} in cache due to error ${JSON.stringify(e)}`
                            );
                    } else {
                        verboseOutput &&
                            console.log(
                                `could not fetch image with id ${icon_url} for zapp ${id} from cache (probably not cached), fetching from network`
                            );
                        const fillCachePromise = fillCacheHandler(icon_url);
                        fillCachePromise.then(resolve);
                    }
                };
                idResult.onerror = event => {
                    console.log(
                        `${icon_url} is missing for zapp ${id} in cache`
                    );
                    fillCacheHandler(icon_url)
                        .then(data => resolve(data))
                        .then(() =>
                            console.log(
                                `successfully fetched ${icon_url} for zapp ${id} from NETWORK`
                            ))
                        .catch(error => {
                            console.error(
                                `error fetching ${icon_url} for zapp ${id} from NETWORK`
                            );
                            reject(error);
                        });
                };
            });
        });
        return { result: resultPromises };
    }

/!*
    getResource(id) {
        return new Promise((resolve, reject) => {
            const request = this.store("readonly").get(id);
            request.onsuccess = event => {
                if (event.target.result) {
                    resolve(event.target.result.content);

                    //update access timestamp
                    event.target.result.accessedOn = new Date();
                    const objectStore = this.store();
                    const putRequest = objectStore.put(event.target.result);
                    if (verboseOutput)
                        putRequest.onsuccess = () =>
                            console.log(
                                `successfully updated timestamp of ${icon_url} for zapp ${id} in cache after fetching from cache`
                            );
                    putRequest.onerror = e =>
                        console.error(
                            `failed to update timestamp of ${icon_url} for zapp ${id} in cache due to error ${JSON.stringify(e)} after fetching from cache`
                        );
                } else {
                    console.log(`could not find image with id ${id}`);
                    reject(null);
                }
            };
            request.onerror = event => {
                reject(event);
            };
        });
    }
*!/

    remove(id) {
        return new Promise((resolve, reject) => {
            const request = this.store("readwrite").delete(id);
            request.onsuccess = result => {
                resolve(result);
            };
            request.onerror = result => {
                reject(result);
            };
        });
    }

    putResource(id, content) {
        const objectStore = this.store();
        const putRequest = objectStore.put({
            id,
            content,
        });
        if (verboseOutput)
            putRequest.onsuccess = () =>
                console.log(`successfully saved item id ${id} in cache`);
        putRequest.onerror = e =>
            console.error(
                `failed to save item with id ${id} in cache due to error ${e}`
            );
    }

    getKeysAndAccessDate() {
        var keys = {};
        const cursor = this.store("readonly").openCursor();
        return new Promise((resolve, reject) => {
            cursor.onsuccess = e => {
                if (e.target.result) {
                    keys[
                        e.target.result.key
                    ] = e.target.result.value.accessedOn;
                    e.target.result.continue();
                } else {
                    resolve(keys);
                }
            };
            cursor.onerror = e => {
                reject(e);
            };
        });
    }
}

// export const cachedResourcesDB = new DB(STORES.cachedResources);
*/

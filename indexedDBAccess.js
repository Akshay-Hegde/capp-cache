const DB_NAME = "RESOURCE_CACHE";
const DB_VERSION = 1;
const STORES = {
    cachedFiles: "cachedFiles"
};

const logger = console.log;

const verboseOutput = false;

export default function(storeName) {
    const result = Object.create(null);
    let _db = null;
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    const store = (type = "readwrite") => {
        const transaction = _db.transaction([storeName], type);
        return transaction.objectStore(storeName);
    };

    result.getResource = id =>
        new Promise((resolve, reject) => {
            const request = store("readonly").get(id);
            request.onsuccess = event => {
                if (event.target.result) {
                    resolve(event.target.result.content);
                } else {
                    logger.log(`could not find resource with id ${id}`);
                    reject(null);
                }
            };
            request.onerror = event => {
                reject(event);
            };
        });

    result.putResource = (id, content) =>
        new Promise((resolve, reject) => {
            const objectStore = store();
            const putRequest = objectStore.put({
                id,
                content
            });
            if (verboseOutput)
                putRequest.onsuccess = () =>
                    logger.log(`successfully saved item id ${id} in cache`);
            putRequest.onerror = e =>
                logger.error(
                    `failed to save item with id ${id} in cache due to error ${e}`
                );
        });

    return new Promise((resolve, reject) => {
        req.onsuccess = e => {
            _db = e.target.result;
            resolve(result);
        };
        req.onupgradeneeded = e => {
            const db = e.target.result;
            if (e.oldVersion > 0) {
                try {
                    db.deleteObjectStore(storeName);
                } catch (e) {
                    logger.log(
                        `exception when trying to delete object store during onupgradeneeded. ${JSON.stringify(e)}`
                    );
                }
            }
            db.createObjectStore(storeName, { keyPath: "id" });
        };
        req.onerror = e => {
            logger.error("failed to open indexedDB " + JSON.stringify(e));
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
                            logger.log(
                                `successfully fetched ${icon_url} for zapp ${id} from cache, result size is ${event.target.result.content.length}`
                            );

                        //update access timestamp
                        event.target.result.accessedOn = new Date();
                        const objectStore = this.store();
                        const putRequest = objectStore.put(event.target.result);
                        if (verboseOutput)
                            putRequest.onsuccess = () =>
                                logger.log(
                                    `successfully updated timestamp of ${icon_url} for zapp ${id} in cache`
                                );
                        putRequest.onerror = e =>
                            logger.error(
                                `failed to update timestamp of ${icon_url} for zapp ${id} in cache due to error ${JSON.stringify(e)}`
                            );
                    } else {
                        verboseOutput &&
                            logger.log(
                                `could not fetch image with id ${icon_url} for zapp ${id} from cache (probably not cached), fetching from network`
                            );
                        const fillCachePromise = fillCacheHandler(icon_url);
                        fillCachePromise.then(resolve);
                    }
                };
                idResult.onerror = event => {
                    logger.log(
                        `${icon_url} is missing for zapp ${id} in cache`
                    );
                    fillCacheHandler(icon_url)
                        .then(data => resolve(data))
                        .then(() =>
                            logger.log(
                                `successfully fetched ${icon_url} for zapp ${id} from NETWORK`
                            ))
                        .catch(error => {
                            logger.error(
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
                            logger.log(
                                `successfully updated timestamp of ${icon_url} for zapp ${id} in cache after fetching from cache`
                            );
                    putRequest.onerror = e =>
                        logger.error(
                            `failed to update timestamp of ${icon_url} for zapp ${id} in cache due to error ${JSON.stringify(e)} after fetching from cache`
                        );
                } else {
                    logger.log(`could not find image with id ${id}`);
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
                logger.log(`successfully saved item id ${id} in cache`);
        putRequest.onerror = e =>
            logger.error(
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


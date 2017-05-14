const DB_NAME = "RESOURCE_CACHE";
const DB_VERSION = 1;
const STORES = {
    cachedFiles: "cachedFiles"
};

const logger = console.log;

const verboseOutput = false;

class DB {
    constructor(storeName) {
        return new Promise((resolve, reject) => {
            this._db = null;
            var req = window.indexedDB.open(DB_NAME, DB_VERSION);
            this.storeName = storeName;
            req.onsuccess = e => {
                this._db = e.target.result;
                resolve(this);
            };
            req.onupgradeneeded = e => {
                const db = e.target.result;
                try {
                    db.deleteObjectStore(this.storeName);
                } catch (e) {
                    logger.info(
                        `exception when trying to delete object store. Possibly first run and the store doesn't exist: ${JSON.stringify(e)}`
                    );
                }
                db.createObjectStore(this.storeName, { keyPath: "id" });
            };
            req.onerror = e => {
                logger.error("failed to open indexedDB " + JSON.stringify(e));
                reject(e);
            };
        });
    }

    store(type = "readwrite") {
        const transaction = this._db.transaction([this.storeName], type);
        return transaction.objectStore(this.storeName);
    }

    getImagesFromCache(zappsInfo, fillCacheHandler) {
        const resultPromises = {};
        const objectStore = this.store("readonly");
        zappsInfo.forEach(({ icon_url, id }) => {
            const idResult = objectStore.get(icon_url);
            resultPromises[id] = new Promise((resolve, reject) => {
                idResult.onsuccess = event => {
                    if (event.target.result) {
                        resolve(event.target.result.base64Data);
                        verboseOutput &&
                            logger.info(
                                `successfully fetched ${icon_url} for zapp ${id} from cache, result size is ${event.target.result.base64Data.length}`
                            );

                        //update access timestamp
                        event.target.result.accessedOn = new Date();
                        const objectStore = this.store();
                        const putRequest = objectStore.put(event.target.result);
                        if (verboseOutput)
                            putRequest.onsuccess = () =>
                                logger.info(
                                    `successfully updated timestamp of ${icon_url} for zapp ${id} in cache`
                                );
                        putRequest.onerror = e =>
                            logger.error(
                                `failed to update timestamp of ${icon_url} for zapp ${id} in cache due to error ${JSON.stringify(e)}`
                            );
                    } else {
                        verboseOutput &&
                            logger.info(
                                `could not fetch image with id ${icon_url} for zapp ${id} from cache (probably not cached), fetching from network`
                            );
                        const fillCachePromise = fillCacheHandler(icon_url);
                        fillCachePromise.then(resolve);
                    }
                };
                idResult.onerror = event => {
                    logger.info(
                        `${icon_url} is missing for zapp ${id} in cache`
                    );
                    fillCacheHandler(icon_url)
                        .then(data => resolve(data))
                        .then(() =>
                            logger.info(
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

    getBase64(id) {
        return new Promise((resolve, reject) => {
            const request = this.store("readonly").get(id);
            request.onsuccess = event => {
                if (event.target.result) {
                    resolve(event.target.result.base64Data);

                    //update access timestamp
                    event.target.result.accessedOn = new Date();
                    const objectStore = this.store();
                    const putRequest = objectStore.put(event.target.result);
                    if (verboseOutput)
                        putRequest.onsuccess = () =>
                            logger.info(
                                `successfully updated timestamp of ${icon_url} for zapp ${id} in cache after fetching from cache`
                            );
                    putRequest.onerror = e =>
                        logger.error(
                            `failed to update timestamp of ${icon_url} for zapp ${id} in cache due to error ${JSON.stringify(e)} after fetching from cache`
                        );
                } else {
                    logger.info(`could not find image with id ${id}`);
                    reject(null);
                }
            };
            request.onerror = event => {
                reject(event);
            };
        });
    }

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

    putResource(id, base64Data) {
        const objectStore = this.store();
        const date = new Date();
        const putRequest = objectStore.put({
            id,
            base64Data,
            createdOn: date,
            accessedOn: date
        });
        if (verboseOutput)
            putRequest.onsuccess = () =>
                logger.info(`successfully saved item id ${id} in cache`);
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

export const cachedResourcesDB = new DB(STORES.cachedResources);

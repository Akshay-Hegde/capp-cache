import { log, error } from "./logger";
import indexedDB from "./indexedDB";

const DB_NAME = "RESOURCE_CACHE";
const DEFAULT_STORE_NAME = "RESOURCES";
const DB_VERSION = 6;

let resolvedPromises = {};

export default function(storeName = DEFAULT_STORE_NAME) {
	if (resolvedPromises[storeName]) {
		return resolvedPromises[storeName];
	}
	const idbWrapper = Object.create(null);
	let _db = null;
	const req = indexedDB.open(DB_NAME, DB_VERSION);

	const store = (type = "readwrite") => {
		const transaction = _db.transaction([storeName], type);
		return transaction.objectStore(storeName);
	};

	idbWrapper.index = property =>
		new Promise((resolve, reject) => {
			const _store = store("readonly");
			const index = _store.index("timestamp");
			const request = index.openCursor();
			request.onsuccess = event => {
				const cursor = event.target.result;
				if (cursor) {
					debugger;
					cursor.continue();
				}
			}
		});

	idbWrapper.get = id =>
		new Promise((resolve, reject) => {
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

	idbWrapper.exists = id =>
		new Promise((resolve, reject) => {
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

	idbWrapper.put = (id, data) =>
		new Promise((resolve, reject) => {
			const objectStore = store();
			const putRequest = objectStore.put(Object.assign(data, {id}));
			putRequest.onsuccess = resolve;
			putRequest.onerror = e => {
				error(`failed to save item with id ${id} in cache due to error ${e}`);
				reject();
			};
		});

	idbWrapper.pruneDb = (knownIds = []) =>
		new Promise((resolve, reject) => {
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

	resolvedPromises[storeName] = new Promise((resolve, reject) => {
		req.onsuccess = e => {
			_db = e.target.result;
			resolve(idbWrapper);
		};
		req.onupgradeneeded = e => {
			const db = e.target.result;
			db.createObjectStore(storeName, { keyPath: "id" });
			db.createObjectStore("TIMESTAMP_HOUSEKEEPING", { keyPath: "id" });
		};
		req.onerror = e => {
			error("failed to open indexedDB " + JSON.stringify(e));
			reject(e);
		};
	});
	return resolvedPromises[storeName];
}

export const closeConnection = () => {
	resolvedPromises = null;
};

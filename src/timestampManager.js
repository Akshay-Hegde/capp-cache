import { on, EVENTS } from "./eventBus";
import indexedDBAccess from "./indexedDBAccess";

const timestampStore = "TIMESTAMP_HOUSEKEEPING";
const DELAY = 2000;

function delayedUpdate(func) {
  setTimeout(func, DELAY);
}

on(EVENTS.RESOURCE_ACCESS, ({ url }) => {
  indexedDBAccess(timestampStore).then(db => {
    delayedUpdate(() => {
      db.put(url, { timestamp: new Date()});
    });
  });
});

export function pruneOldCacheEntries(thresholdData) {
  let timestampDB, cacheDB;
  indexedDBAccess(timestampStore)
    .then(db => {
      timestampDB = db;
      return indexedDBAccess();
    })
    .then(db => {
      cacheDB = db;
    })
	  .then(()=>{
		  timestampDB.index("timestamp");
	  })
}

setTimeout(() => pruneOldCacheEntries(new Date()), 3000);
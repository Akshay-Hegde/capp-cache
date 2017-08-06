import { on, EVENTS } from "./eventBus";
import { log, error } from "./cappCacheLogger";
import indexedDBAccess from "./indexedDBAccess";

const timestampStore = "TIMESTAMP_HOUSEKEEPING";
const UPDATE_TIMESTAMP_WAIT = 2000;
const RUN_PRUNE_WAIT = 12000;
const MS_IN_A_SECOND = 1000;

function scheduleLowPriorityTask(func, delay) {
  if (window.requestIdleCallback) {
    const _func = func;
    func = () => requestIdleCallback(_func);
  }
  setTimeout(func, delay);
}

on(EVENTS.RESOURCE_ACCESS, ({ url }) => {
  indexedDBAccess(timestampStore)
    .then(db => {
      scheduleLowPriorityTask(() => {
        db.put(url, { timestamp: new Date() });
      }, UPDATE_TIMESTAMP_WAIT);
    })
    .catch(err => error(err));
});

function pruneOldCacheEntries(maxAge) {
  let timestampDB, cacheDB, toDelete;
  return indexedDBAccess(timestampStore)
    .then(db => {
      timestampDB = db;
      return indexedDBAccess();
    })
    .then(db => {
      cacheDB = db;
    })
    .then(() => {
      const ttlInMs = maxAge * MS_IN_A_SECOND;
      const upperBound = new Date(Date.now() - ttlInMs);
      return timestampDB.queryIndex("timestamp", IDBKeyRange.upperBound(upperBound));
    })
    .then(results => {
      toDelete = results;
      return Promise.all(toDelete.map(id => cacheDB.removeResource(id)));
    })
    .then(() => {
      return Promise.all(toDelete.map(id => timestampDB.removeResource(id)));
    })
	  .catch(e=>error(e)); //todo: remove
}

export function schedulePrune(ttl) {
  scheduleLowPriorityTask(() => {
    pruneOldCacheEntries(ttl)
      .then(() => log(`completed pruning database from obsolete resources`))
      .catch(err => error(`removing old resources filed with error ${err}`));
  }, RUN_PRUNE_WAIT);
}

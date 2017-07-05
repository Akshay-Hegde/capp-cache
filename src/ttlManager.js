import idbAccess from "./indexedDBAccess";
import { error, log } from "./logger";

const FLUSH_WAIT = 6000;
const pendingChanges = {};

let pendingTask = null;

const scheduleFlush = () => {
  if (pendingTask) {
    clearTimeout(pendingTask);
  }
  pendingTask = setTimeout(() => {
    const now = new Date();
    Object.keys(pendingChanges).forEach(storeName => {
      idbAccess(storeName)
        .then(db => {
          const urls = pendingChanges[storeName];
          urls.forEach(url => {
            db
              .get(url)
              .then(resource => {
                const newResource = { ...resource, timestamp: now };
                log(`updating timestamp for ${url} from ${resource.timestamp} to ${now}`);
                return db.put(newResource.id, newResource);
              })
              .catch(err => error(err));
          });
        })
        .catch(err => {
          //todo
        });
    });
  }, FLUSH_WAIT);
};

export function updateTimestamp({ resources }) {
  resources.forEach(resource => {
    if (pendingChanges[resource.storeName] === undefined) {
      pendingChanges[resource.storeName] = [];
    }
    pendingChanges[resource.storeName].push(resource.url);
  });
  scheduleFlush();
}

import { fetchResource } from "./network";
import { error, log } from "./logger";
import { id } from "./id";

export const fetchAndSaveInCache = ({ url, isBinary, indexedDBAccess }) =>
  new Promise((resolve, reject) => {
    log(`fetching resource ${url} to cache ${isBinary ? "as binary" : ""}`);
    fetchResource(url, isBinary ? "blob" : undefined)
      .then(result => {
        log(`successfully fetched resource ${url} to cache`);
        resolve(result);
        indexedDBAccess.put(id(url), result);
      })
      .catch(e => {
        error(`failed to fetch resource ${url} from web; error ${e.msg}\n${e.stack}`);
        reject(e);
      });
  });

import { fetchAndSaveInCache } from "./fetchToCache";
import indexedDBAccess from "./indexedDBAccess";
import actions from "./workerActions";
import { on, trigger } from "./eventBus";
import globalObj from "./self";

const FETCHING_COMPLETE = "FETCHING_COMPLETE";

let fetchingInFlight = 0;
function die() {
  globalObj.postMessage({ action: actions.CLOSING, success: true, payload: {} });
  close();
}

globalObj.addEventListener("message", ({ data }) => {
  indexedDBAccess().then(idbAccess => {
    switch (data.action) {
      case actions.FETCH:
        ++fetchingInFlight;
        const { url, isBinary } = data.payload;
        fetchAndSaveInCache({ url, isBinary, indexedDBAccess: idbAccess })
          .then(() => {
            globalObj.postMessage({ action: actions.FETCH_SUCCESS, success: true, payload: { url } });
          })
          .catch(error => {
            globalObj.postMessage({
              action: actions.FETCH_FAIL,
              success: false,
              payload: { url, error: { status: error.status, statusText: error.statusText } },
            });
          })
          .then(() => {
            --fetchingInFlight;
            if (fetchingInFlight === 0) {
              trigger(FETCHING_COMPLETE);
            }
          });
        return;
      case actions.CLOSE:
        if (fetchingInFlight === 0) {
          die();
        } else {
          on(FETCHING_COMPLETE, die);
        }
    }
  });
});

import { LOG_LEVELS, setLogLevel, error } from "./src/logger";
import { load, pruneDB, getResourceUri, revokeResourceUriForUrl, getLoadedResources } from "./src/resourceManager";
import { on, trigger } from "./src/eventBus";
import manifestManager from "./src/manifestManager";

(function init() {
  if (
    window.location.search.indexOf("debug-cp") > 0 ||
    (window.top && window.top.location.search.indexOf("debug-cp") > 0)
  ) {
    setLogLevel(LOG_LEVELS.log);
  }
  const manifestUrl = document.getElementsByTagName("html")[0].dataset.ccManifest;
  if (manifestUrl !== undefined) {
    manifestManager
      .fetchManifest(manifestUrl)
      .then(({ manifest, wasModified }) => {
        if (wasModified) {
          load(manifest, { syncCacheOnly: true, wasManifestModified: true })
            .then(() => {
              trigger("manifestUpdated");
            })
            .catch(err => error(`failed to load manifest to cache after change ${err}`));
        }
      })
      .catch(err => {
        error(`error while fetching manifest ${err}`);
      });
  } else {
    error(`Unable to find attribute "data-cc-manifest" on the HTML tag, CappCache will not work`);
  }
  window.cappCache = {
    loadResources: load,
    getResourceUri,
    revokeResourceUriForUrl,
    pruneDB,
    on,
    getLoadedResources,
    setLogLevel,
    LOG_LEVELS,
  };
})();

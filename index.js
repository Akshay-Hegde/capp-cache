import { LOG_LEVELS, setLogLevel, error } from "./src/cappCacheLogger";
import { load, pruneDB, getResourceUri, revokeResourceUriForUrl, getLoadedResources } from "./src/resourceManager";
import { on, trigger } from "./src/eventBus";
import manifestManager from "./src/manifestManager";
import { schedulePrune } from "./src/timestampManager";

(function init() {
  if (window.location.search.indexOf("debug-cp") > 0) {
    setLogLevel(LOG_LEVELS.log);
  }
  const dataset = document.getElementsByTagName("html")[0].dataset;
  const overrideDomContentLoaded = dataset.ccOverrideDomcontentloaded === "true";
  if (overrideDomContentLoaded) {
    const listener = e => {
      e.stopImmediatePropagation();
      e.preventDefault();
      e.stopPropagation();
      document.removeEventListener("DOMContentLoaded", listener, true);
    };
    document.addEventListener("DOMContentLoaded", listener, true);
  }
  const manifestUrl = dataset.ccManifest;
  if (manifestUrl !== undefined) {
    manifestManager
      .fetchManifest(manifestUrl, { overrideDomContentLoaded: overrideDomContentLoaded })
      .then(({ manifest, wasModified }) => {
        if (wasModified) {
          load(manifest, { syncCacheOnly: true, wasManifestModified: true })
            .then(() => {
              trigger("manifestUpdated");
            })
            .catch(err => error(`failed to load manifest to cache after change ${err}`));
        } else {
          if (manifest.ttl) {
            schedulePrune(manifest.ttl);
          }
        }
      })
      .catch(err => {
        error(`error while fetching manifest ${err}`);
      });
  } else {
    error(`Unable to find attribute "data-cc-manifest" on the HTML tag, CappCache will not work`);
  }
  window.cappCache = {
    /*version-placeholder*/ //this is a placeholder for the version field, it is replaced by Webpack in build time
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

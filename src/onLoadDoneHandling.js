import { perfMarkEnd, isDetailedLog, log } from "./cappCacheLogger";
import { getDataUrl } from "./utils";

const RESOURCES_LOAD_START = "Resources load start";

export function appendOnLoadScript({
  document: documentTarget,
  callback,
  overrideDomContentLoaded,
  onLoadDone = Function.prototype,
  elementAddedToBody,
}) {
  const ID = `__cappcache-${("" + Math.random()).slice(2, 10)}`;
  const onLoadTypeOf = typeof onLoadDone;
  let onLoadText = "";
  if (onLoadTypeOf === "string") {
    onLoadText = onLoadDone;
  } else if (onLoadTypeOf === "function") {
    const _prevCallback = callback;
    callback = () => {
      onLoadDone();
      _prevCallback();
    };
  }
  window.cappCache[ID] = callback;
  const ID_PERF = ID + "__perf";
  window.cappCache[ID_PERF] = isDetailedLog()
    ? () => {
        perfMarkEnd("RESOURCES LOAD", RESOURCES_LOAD_START);
        log("Done loading resources");
      }
    : Function.prototype;
  const contentUrl = getDataUrl(`window.cappCache["${ID}"](); 
		      window.cappCache["${ID_PERF}"](); 
		      delete window.cappCache["${ID}"]; 
		      delete window.cappCache["${ID_PERF}"]; 
		      ${overrideDomContentLoaded ? "document.dispatchEvent(new Event('DOMContentLoaded', {bubbles: true}));" : ""}
		      ${onLoadText};
		      document.querySelector("#${ID}").remove();`);
  const script = documentTarget.createElement("script");
  script.id = ID;
  script.async = false;
  script.src = contentUrl;
  documentTarget[elementAddedToBody ? "body" : "head"].appendChild(script);
}

import { perfMarkEnd, isDetailedLog } from "./cappCacheLogger";

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
	window.cappCache[ID + "__perf"] = isDetailedLog() ? () => perfMarkEnd("RESOURCES LOAD", RESOURCES_LOAD_START) : Function.prototype;
  const content = `data:text/javascript, 
		      window.cappCache["${ID}"](); 
		      window.cappCache["${ID + "__perf"}"](); 
		      delete window.cappCache["${ID}"]; 
		      ${overrideDomContentLoaded ? "document.dispatchEvent(new Event('DOMContentLoaded', {bubbles: true}));" : ""}
		      ${onLoadText}
		      console.log("DONE - onLoadHandling");
		      document.querySelector("#${ID}").remove()`;
  const script = documentTarget.createElement("script");
  script.id = ID;
  script.async = false;
  script.src = content;
  documentTarget[elementAddedToBody ? "body" : "head"].appendChild(script);
}

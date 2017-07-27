export function appendOnLoadScript({
  document: documentTarget,
  callback,
  overrideDomContentLoaded,
  onLoadDone = Function.prototype,
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
  const content = ` 
		      window.cappCache["${ID}"](); 
		      delete window.cappCache["${ID}"]; 
		      console.log("CAPP_CACHE_DONE");
		      ${overrideDomContentLoaded ? "document.dispatchEvent(new Event('DOMContentLoaded', {bubbles: true}));" : ""}
		      ${onLoadText}
		      document.querySelector("#${ID}").remove()`;
  const script = documentTarget.createElement("script");
  script.id = ID;
  script.appendChild(documentTarget.createTextNode(content));
  documentTarget.head.appendChild(script);
}

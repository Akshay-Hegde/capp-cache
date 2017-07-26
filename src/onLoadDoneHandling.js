import { log } from "./cappCacheLogger";

export function handleOnLoadDoneCb(onLoadDone, resources, overrideDomContentLoaded) {
  if (typeof onLoadDone === "function") {
    const privateCallback = "___onLoadDoneCallback";
    window.cappCache && (window.cappCache[privateCallback] = onLoadDone);
    onLoadDone = `window.cappCache["${privateCallback}"](); delete window.cappCache["${privateCallback}"];`;
  }
  let onLoadDoneCBWhenThereAreNoResources = Function.prototype; //this is a fallback callback, called when ALL resources are async, cacheOnly or not scripts
  let domContentLoadedCb = "";
  if (overrideDomContentLoaded) {
    domContentLoadedCb = "document.dispatchEvent(new Event('DOMContentLoaded', {bubbles: true}));";
  }
  if (onLoadDone || overrideDomContentLoaded) {
    let i = resources.length - 1,
      found = false;
    while (i > -1 && !found) {
      let resource = resources[i];
      if (!resource.attributes) {
        resource.attributes = {};
      }
      if (!resource.attributes.async && !resource.cacheOnly && (resource.type === "js" || !resource.type)) {
        found = true;
        const originalOnLoad = resource.attributes.onload || "";
        resource.attributes.onload = onLoadDone + "\n" + domContentLoadedCb + "\n" + originalOnLoad;
      }
      i--;
    }
    if (!found) {
      log(
        "could not find appropriate script for global onload callback. Falling back to notifying after all resources are added to DOM"
      );
      onLoadDoneCBWhenThereAreNoResources = new Function(onLoadDone + "\n" + domContentLoadedCb);
    }
  }
  return onLoadDoneCBWhenThereAreNoResources;
}

export function appendOnLoadScript({ callback, onLoadDone, overrideDomContentLoaded }) {
  callback();
  if (typeof onLoadDone === "string") {
    eval(onLoadDone);
  } else if (typeof onLoadDone === "function") {
    onLoadDone();
  }
  if (overrideDomContentLoaded) {
    global.domContentLoaded();
  }
}

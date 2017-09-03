export default window.indexedDB || {
  open: () => {
    const req = {};
    setTimeout(() =>
      req.onerror(
        "No indexedDB on window. This is a known Edge/IE bug, see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9968399 "
      )
    );
    return req;
  },
};

const polyfillId = url => {
  const link = document.createElement("a");
  link.href = url;
  return link.protocol + "//" + link.host + link.pathname + link.search;
};

export const id = url => {
  if (window.URL) {
    const { href } = new URL(url, window.location.href);
    return href;
  } else {
    return polyfillId(url);
  }
};

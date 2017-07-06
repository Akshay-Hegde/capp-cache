const polyfillId = url => {
  const link = document.createElement("a");
  link.href = url;
  return link.protocol + "//" + link.host + link.pathname + link.search;
};

export const id = url => {
  if (self.URL) {
    const { href } = new URL(url, self.location.href);
    return href;
  } else {
    return polyfillId(url);
  }
};

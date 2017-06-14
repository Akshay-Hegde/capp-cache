export const id = url => {
  const link = document.createElement("a");
  link.href = url;
  return link.protocol + "//" + link.host + link.pathname + link.search;
};

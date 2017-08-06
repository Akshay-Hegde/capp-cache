export const encodeForDataUrl = text => {
  return text.replace(/#/g, "%23").replace(/(\r\n|\n|\r)/gm, "%0A").replace(/</g, "%3C").replace(/\s\s/g, " ");
};

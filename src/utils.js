const isEdgeBrowser = !!(window.navigator && window.navigator.userAgent.indexOf("Edge") > -1);

export const getDataUrl = (content, contentType = "text/javascript", isBase64 = false) => {
  if (isEdgeBrowser) {
  //   edge doesn't properly support data URI, especially for Javascript :(
    return URL.createObjectURL(new Blob([content], { type: contentType }));
  }
  content = content.replace(/#/g, "%23").replace(/(\r\n|\n|\r)/gm, "%0A").replace(/</g, "%3C").replace(/\s\s/g, " ");
  return `data:${contentType}${isBase64 ? ";base64" : ""},${content}`;
};

import { getDataUrl } from "./utils";

export default {
  js: {
    tagName: "script",
    contentFetchKey: "src",
    attributes: {
      type: "text/javascript",
    },
    setElementContentFunc({ tag, documentTarget, content, wasManifestModified }) {
      if (wasManifestModified) {
        tag.setAttribute("src", getDataUrl(content)); //if some of the files have changed, adding some script as inline scripts and some with src="" doesn't maintain the order of loading
      } else {
        tag.appendChild(documentTarget.createTextNode(content));
      }
    },
    canAddToDom: true,
  },
  css: {
    tagName: "style",
    contentFetchKey: "href",
    attributes: {
      type: "text/css",
    },
    tagNameWhenNotInline: "link",
    attributesWhenNotInline: {
      rel: "stylesheet",
    },
    setElementContentFunc({ tag, content }) {
      tag.innerHTML = content;
    },
    canAddToDom: true,
  },
  blob: {
    canAddToDom: false,
    attributes: {},
  },
  link: {
    tagName: "link",
    contentFetchKey: "href",
    canAddToDom: true,
    setElementContentFunc({ tag, content }) {
      tag.href = URL.createObjectURL(content);
    },
    attributes: {},
    defaultToBinary: true,
    allowLoadingOutOfOrder: true,
  },
  fontface: {
    tagName: "style",
    attributes: {
      type: "text/css",
    },
    allowLoadingOutOfOrder: true,
    defaultToBinary: true,
    setElementContentFunc({ tag, content, resourceManifestObj }) {
      const {
        fontAttributes,
        localFontFamily = null,
        url: originalUrl,
        format,
        fallbackUrls = null,
      } = resourceManifestObj;
      let attributesString = "";
      Object.keys(fontAttributes).forEach(attribute => {
        attributesString += `\n  ${attribute}: ${fontAttributes[attribute]};`;
      });
      let srcString = "src: ";
      if (localFontFamily) {
        srcString = localFontFamily.reduce((str, url) => `${str}local('${url}'), `, srcString);
      }
      let actualUrl;
      if (content !== undefined) {
        actualUrl = URL.createObjectURL(content);
      } else {
        actualUrl = originalUrl;
      }
      if (srcString) {
        srcString += `url(${actualUrl}) format('${format}')`;
      }
      if (fallbackUrls) {
        srcString = fallbackUrls.reduce((str, opts) => {
          let { url, format } = opts;
          format = format || "woff2";
          return `\n  ${str} url(${url}) format('${format}'), `;
        }, `${srcString}, `);
        srcString = srcString.substring(0, srcString.length - 2); //remove last comma
      }
      tag.innerHTML = "@font-face {" + `${attributesString}` + `${srcString};` + `\n}`;
    },
    canAddToDom: true,
    alwaysCallSetContent: true,
  },
};

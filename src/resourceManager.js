import { error } from "./logger";
import indexedDBAccess from "./indexedDBAccess";
import tagPropertiesMap from "./tagPropertiesMap";
import { loadResource, getCachedFiles } from "./resourceLoader";

// We use this mock document when loading assets with "cacheOnly" property. this keeps code consistent (no "if cacheOnly... else... ),
// while avoiding performance hit of adding unnecessary elements to the DOM when we just want to pre-cache the elements
const MOCK_DOCUMENT = {
  createElement: () => ({
    appendChild: Function.prototype,
    setAttribute: Function.prototype,
  }),
  head: { appendChild: Function.prototype },
  body: { appendChild: Function.prototype },
  createTextNode: Function.prototype,
};
const loadedResources = [];

/**
 * Loads a list of resources according to the manifest.
 * */
export function load({ resources = [], document = window.document }, { syncCacheOnly = false } = {}) {
  return new Promise((resolve, reject) => {
    if (resources.length === 0) {
      return resolve();
    }
    indexedDBAccess().then(db => {
      const orderedResources = resources.filter(r => !r.cacheOnly).concat(resources.filter(r => r.cacheOnly));
      let lastErr = undefined;

      orderedResources.forEach(
        ({ url, type = "js", target = "head", attributes = {}, cacheOnly = false, isBinary}, index) => {
          const userAttributes = attributes;
          const staticAttributes = tagPropertiesMap[type];
          if (staticAttributes === undefined) {
            return error(`Unsupported tag ${type}`);
          }
          if (staticAttributes.defaultToBinary !== undefined){
	          isBinary = staticAttributes.defaultToBinary;
          } else {
	          isBinary = true;
          }
	        const documentTarget = cacheOnly || syncCacheOnly || !staticAttributes.canAddToDom
            ? MOCK_DOCUMENT
            : document;
          let tag;

          loadResource({ indexedDBAccess: db, url, immediate: false, isBinary })
            .then(({ resource }) => {
              /* resource already cached */
              tag = documentTarget.createElement(staticAttributes.tagName);

              let { content } = resource;
              if (type === "js") {
	              let onLoadScript = "";
              	if (userAttributes["onload"]) {
		              onLoadScript = `/*--- capp-cache onload handler---*/\n${userAttributes["onload"]}`;
	              }
	              content = `//# sourceURL=${url}\n${content}\n${onLoadScript}`;
              }
              staticAttributes.setElementContentFunc(tag, documentTarget, content);
              tag.setAttribute("data-cappcache-src", url);
            })
            .catch(e => {
              /* resource is not in cache */
              let tagType = staticAttributes.tagName;
              if (staticAttributes.tagNameWhenNotInline !== undefined) {
                tagType = staticAttributes.tagNameWhenNotInline;
                staticAttributes.attributes = staticAttributes.attributesWhenNotInline;
              }
              tag = documentTarget.createElement(tagType);
              tag.setAttribute(staticAttributes.contentFetchKey, url);
              tag.async = !!userAttributes["async"];
            })
            .then(() => {
              /* All types of tags, inline and non inline */
              Object.keys(userAttributes).forEach(attribute => {
              	if (attribute!== "async") {
		              tag.setAttribute(attribute, userAttributes[attribute]);
	              }
              });
              Object.keys(staticAttributes.attributes).forEach(attribute => {
                tag.setAttribute(attribute, staticAttributes.attributes[attribute]);
              });
	            loadedResources.push({ url });
              documentTarget[target].appendChild(tag);
            })
            .catch(err => {
              lastErr = err;
            })
            .then(() => {
              if (index === orderedResources.length - 1) {
                if (lastErr !== undefined) {
                  error(`Error while loading resources ${lastErr}`);
                  reject(lastErr);
                } else {
                  resolve();
                }
              }
            });
        }
      );
    });
  });
}
export function getLoadedResources() {
  return loadedResources.map(i => ({ url: i.url }));
}
const resourceUriHistory = {};

export function getResourceUri({ url, isBase64Text = false, isBinary = true }) {
  return new Promise((resolve, reject) => {
    if (isBinary && resourceUriHistory[url]) {
      return resolve(resourceUriHistory[url]);
    }
    indexedDBAccess()
      .then(db => {
        return loadResource({ indexedDBAccess: db, url, immediate: true, isBinary });
      })
      .then(({ resource }) => {
        const { content, contentType } = resource;
        if (isBinary) {
          return URL.createObjectURL(content);
        } else {
          return `data:${contentType}${isBase64Text ? ";base64" :  ""},${isBase64Text ? btoa(content) : content}`;
        }
      })
      .then(dataUrl => {
        if (isBinary) {
          resourceUriHistory[url] = dataUrl;
        }
        resolve(dataUrl);
      })
      .catch(e => {
        error(`failed to fetch resource ${e}`);
        reject(null);
      });
  });
}

export function revokeResourceUriForUrl(url) {
  const resourceUri = resourceUriHistory[url];
  if (resourceUri) {
    resourceUriHistory[url] = null;
    URL.revokeObjectURL(url);
  }
}

/**
 * Clears indexedDB from any files on this page which were not loaded in this session by calling the load function.
 * Call this function to remove old obsolete files from the cache.
 */
export function pruneDB() {
  indexedDBAccess().then(db => {
    db.pruneDb(getCachedFiles());
  });
}

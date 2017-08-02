import { error, log, perfMark, perfMarkEnd } from "./cappCacheLogger";
import indexedDBAccess from "./indexedDBAccess";
import tagPropertiesMap from "./tagPropertiesMap";
import { loadResource, getCachedFiles } from "./resourceLoader";
import { sortResources } from "./sortResources";
import { appendOnLoadScript } from "./onLoadDoneHandling";

const RESOURCES_LOAD_START = "Resources load start";
const DATA_SRC_ATTR = "data-cappcache-src";

const WAITING = "waiting";
const LOADED = "loaded";

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
export function load(
  {
    resources = [],
    document = window.document,
    forceLoadFromCache = false,
    onLoadDone,
    recacheAfterVersionChange = false,
  },
  { syncCacheOnly = false, wasManifestModified = false, overrideDomContentLoaded = false, forceRecaching = false } = {}
) {
  perfMark(RESOURCES_LOAD_START);
  if (recacheAfterVersionChange === true && wasManifestModified === true) {
    forceRecaching = true;
  }
  let elementAddedToBody = false;
  return new Promise((resolve, reject) => {
    if (resources.length === 0) {
      return resolve();
    }
    indexedDBAccess().then(db => {
      sortResources(resources);
      let lastErr = undefined;

      const tagsReadyToBeAdded = [];
      let parsedTagsCount = 0;
      let allFromCache = true;
      const resourcesResult = [];
      resources.forEach(resourceManifestObj => {
        let {
          url,
          type = "js",
          target = "head",
          attributes = {},
          cacheOnly = false,
          isBinary,
          networkOnly = false,
        } = resourceManifestObj;
        if (target === "body") elementAddedToBody = true;
        perfMark(`load start ${url}`);
        const userAttributes = attributes;
        const staticAttributes = tagPropertiesMap[type];
        if (staticAttributes === undefined) {
          return error(`Unsupported tag ${type}`);
        }
        if (staticAttributes.defaultToBinary !== undefined) {
          isBinary = staticAttributes.defaultToBinary;
        } else {
          isBinary = false;
        }
        const documentTarget = cacheOnly || syncCacheOnly || !staticAttributes.canAddToDom ? MOCK_DOCUMENT : document;
        let tag;

        loadResource({
          indexedDBAccess: db,
          url,
          immediate: forceLoadFromCache,
          isBinary,
          cacheOnly: cacheOnly || syncCacheOnly,
          forceRecaching,
          networkOnly,
        })
          /* resource already cached */
          .then(({ resource }) => {
            resourcesResult.push({ url, fromCache: true });
            tag = documentTarget.createElement(staticAttributes.tagName);

            let { content } = resource;
            if (type === "js") {
              let onLoadScript = "";
              if (userAttributes["onload"]) {
                onLoadScript = `/*--- capp-cache onload handler---*/\n${userAttributes["onload"]}`;
              }
              content = `//# sourceURL=${url}\n${content}\n${onLoadScript}`;
            }
            staticAttributes.setElementContentFunc({
              tag,
              documentTarget,
              content,
              resourceManifestObj,
              wasManifestModified,
            });
            tag.setAttribute("data-cappcache-src", url);
          })
          /* resource is not in cache */
          .catch(e => {
            if (e === null) {
              //there is no error, the resource is simply not in cache
              allFromCache = false;
              resourcesResult.push({ url, fromCache: false });
              let tagType = staticAttributes.tagName;
              if (staticAttributes.tagNameWhenNotInline !== undefined) {
                tagType = staticAttributes.tagNameWhenNotInline;
                staticAttributes.attributes = staticAttributes.attributesWhenNotInline;
              }
              tag = documentTarget.createElement(tagType);
              if (staticAttributes.alwaysCallSetContent) {
                staticAttributes.setElementContentFunc({ tag, documentTarget, resourceManifestObj });
              }
              if (staticAttributes.contentFetchKey) {
                tag.setAttribute(staticAttributes.contentFetchKey, url);
              }
              tag.async = !!userAttributes["async"];
            } else {
              error(`error trying to load resource ${e}`);
              return Promise.reject();
            }
          })
          /* Common code for all cases, in cache and not in cache */
          .then(() => {
            Object.keys(userAttributes).forEach(attribute => {
              if (attribute !== "async") {
                tag.setAttribute(attribute, userAttributes[attribute]);
              }
            });
            Object.keys(staticAttributes.attributes).forEach(attribute => {
              tag.setAttribute(attribute, staticAttributes.attributes[attribute]);
            });
            loadedResources.push({
              url,
              domSelector:
                documentTarget === MOCK_DOCUMENT ? null : `${staticAttributes.tagName}[${DATA_SRC_ATTR}="${url}"]`,
            });
            if (!cacheOnly) {
              let currPos = resourceManifestObj._index;
              tagsReadyToBeAdded[currPos] = { state: WAITING, domTarget: documentTarget[target], tag, url };
              if (
                currPos === 0 ||
                staticAttributes.allowLoadingOutOfOrder ||
                userAttributes.async ||
                (currPos > 0 &&
                  tagsReadyToBeAdded[currPos - 1] !== undefined &&
                  tagsReadyToBeAdded[currPos - 1].state === LOADED)
              ) {
                while (tagsReadyToBeAdded[currPos] !== undefined && tagsReadyToBeAdded[currPos].state === WAITING) {
                  const { domTarget, tag, url } = tagsReadyToBeAdded[currPos];
                  perfMark(url);
                  domTarget.appendChild(tag);
                  log(`%c added [${url}] to the ${target}`, "color: blue");
                  perfMarkEnd(`add to DOM ${url}`, url);
                  tagsReadyToBeAdded[currPos].state = LOADED;
                  currPos++;
                }
              } else {
                log(`skipping resource ${url} since the previous resource was not loaded yet`);
              }
            }
          })
          .catch(err => {
            lastErr = err;
          })
          .then(() => {
            ++parsedTagsCount;
            if (parsedTagsCount === resources.length) {
              if (lastErr !== undefined) {
                error(`Error while loading resources ${lastErr}`);
                reject(lastErr);
              } else {
                appendOnLoadScript({
                  document,
                  callback: () => {
                    resolve({ resources: resourcesResult, allFromCache });
                  },
                  overrideDomContentLoaded,
                  onLoadDone,
                  elementAddedToBody,
                });
                perfMarkEnd("RESOURCES LOAD", RESOURCES_LOAD_START);
              }
            }
          });
      });
    });
  });
}
export function getLoadedResources() {
  return loadedResources.map(i => ({ url: i.url, domSelector: i.domSelector }));
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
          return `data:${contentType}${isBase64Text ? ";base64" : ""},${isBase64Text ? btoa(content) : content}`;
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

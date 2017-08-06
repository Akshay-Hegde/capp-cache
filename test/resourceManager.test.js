jest.mock("../src/network", () => require("./mocks/mockNetwork"));
jest.mock("../src/id", () => ({ id: id => id }));
jest.mock("../src/indexedDB", () => require("./mocks/mockIDB").mock);
jest.mock("../src/onLoadDoneHandling", () => require("./mocks/mockOnLoadDoneHandling"));
const { load, getResourceUri, getLoadedResources } = require("../src/resourceManager");
const mockIDB = require("./mocks/mockIDB").mock;

const DUMMY1 = "dummy.url1";
const DUMMY2 = "dummy.url2";
const DUMMY3 = "dummy.url3";
const DUMMY4 = "dummy.url4";

const head = {
  name: "HEAD",
  appendChild: jest.fn(),
};
const body = {
  name: "BODY",
  appendChild: jest.fn(),
};
const scriptTag = {
  name: "SCRIPT",
  setAttribute: jest.fn(),
  appendChild: jest.fn(),
};
const cssTag = {
  name: "CSS",
  setAttribute: jest.fn(),
};
const linkTag = {
  name: "LINK",
  setAttribute: jest.fn(),
};

const getTag = type => {
  switch (type) {
    case "script":
      return scriptTag;
    case "style":
      return cssTag;
    case "link":
      return linkTag;
    case "fontface":
      return scriptTag;
    default:
      console.error(`unable to find type ${type}`);
      return null;
  }
};

const document = {
  name: "mock testing document",
  createElement: jest.fn(type => getTag(type)),
  createTextNode: jest.fn(content => `mock script: ${content}`),
  head,
  body,
};

beforeEach(() => {
  mockIDB.resetDB();
});

it("handles manifest with empty array resources", async () => {
  return await load({
    resources: [],

    document,
  });
});
it("handles manifest with no resources ", async () => {
  await load({
    document,
  });
});

it("fetches files to cache according to manifest", async () => {
  await load({ resources: [{ url: DUMMY1 }, { url: DUMMY2 }], document });
  await jest.runAllTimers();
  expect(mockIDB.dbData()[DUMMY1]).toBeTruthy();
  expect(mockIDB.dbData()[DUMMY2]).toBeTruthy();
});
it("adds elements to head by default", async () => {
  await load({ resources: [{ url: DUMMY1 }, { url: DUMMY2 }], document });
  await jest.runAllTimers();
  expect(head.appendChild).toHaveBeenCalledTimes(2);
});
it("applies the properties of a resource from the manifest", async () => {
  await load({
    resources: [
      { url: DUMMY1, target: "head", type: "js" },
      { url: DUMMY2, target: "body", type: "css" },
      {
        url: DUMMY3,
        attributes: {
          async: true,
          onload: "console.log('hello')",
        },
      },
    ],
    document,
  });
  await jest.runAllTimers();
  expect(document.head.appendChild).toHaveBeenCalledTimes(2);
  expect(document.body.appendChild).toHaveBeenCalledTimes(1);
});
it("does not append to the dom cacheOnly resources", async () => {
  await load({ resources: [{ url: DUMMY1, cacheOnly: true }], document });
  expect(head.appendChild).not.toHaveBeenCalled();
});
it("does not get the actual resource for cacheonly resources", async () => {
  await load({ resources: [{ url: DUMMY1, cacheOnly: true }], document });
  expect(mockIDB.registerCall.mock.calls[0]).toEqual(["count"]);
});
it("downloads to the cache cacheOnly resources", async () => {
  await load({ resources: [{ url: DUMMY1, cacheOnly: true }], document });
  await jest.runAllTimers();
  expect(mockIDB.dbData()[DUMMY1]).toBeTruthy();
});
it("fetches network only resources from the network and doesn't cache it", async () => {
  await load({ resources: [{ url: DUMMY1 }, { url: DUMMY2, networkOnly: true }], document });
  await jest.runAllTimers();
  await load({ resources: [{ url: DUMMY2, networkOnly: true }], document });
  await jest.runAllTimers();
  expect(mockIDB.dbData()[DUMMY2]).toBeUndefined();
  expect(scriptTag.appendChild.mock.calls).toHaveLength(0);
  expect(
    scriptTag.setAttribute.mock.calls.filter(c => {
      return c[0] === "src" && c[1] === DUMMY2;
    })
  ).toHaveLength(2);
});
it("does not try to add blob to the DOM", async () => {
  await load({ resources: [{ url: DUMMY1, type: "blob" }], document });
  await jest.runAllTimers();
  expect(mockIDB.dbData()[DUMMY1]).toBeTruthy();
  expect(head.appendChild).not.toHaveBeenCalled();
});
it("adds the script inline when the script is in the cache", async () => {
  scriptTag.appendChild.mockClear();
  await load({
    resources: [{ url: DUMMY1, attributes: { attr1: true, attr2: "attr2 value" }, cacheOnly: true }],
    document,
  });
  await jest.runAllTimers();
  await load({
    resources: [{ url: DUMMY1, attributes: { attr1: true, attr2: "attr2 value" } }],
    document,
  });
  await jest.runAllTimers();
  expect(scriptTag.appendChild).toHaveBeenCalledWith(expect.stringMatching(/mock response/));
});
it("allow the user to load resources such as image with a programmatic API", async () => {
  const SVG_URL = "svg";
  const SVG_CONTENT = `<use xlink:href=\"#btNuzo4gP\" opacity=\"1\" fill=\"#666666\" fill-opacity=\"0.66\"></use>`;
  require("./mocks/mockNetwork").configureResponse(SVG_URL, { content: SVG_CONTENT, contentType: "image/svg+xml" });
  const content = await getResourceUri({ url: SVG_URL, isBinary: false });
  expect(content.length).toBeGreaterThan(SVG_CONTENT.length);
  expect(content.indexOf("#")).toBe(-1); //since we have a response handler that escapes "#"

  //idb already has resource
  const cachedContent = await getResourceUri({ url: SVG_URL, isBinary: false });
  expect(cachedContent.length).toBeGreaterThan(SVG_CONTENT.length);
  expect(cachedContent.indexOf("#")).toBe(-1);
});
it("adds an src to the script when the script is not in the cache", async () => {
  scriptTag.appendChild.mockClear();
  scriptTag.setAttribute.mockClear();
  await load({
    resources: [{ url: DUMMY1, attributes: { attr1: true, attr2: "attr2 value" } }],
    document,
  });
  await jest.runAllTimers();
  expect(scriptTag.appendChild).not.toHaveBeenCalled();
  expect(scriptTag.setAttribute.mock.calls.filter(call => call[0] === "src")).toMatchObject([["src", DUMMY1]]);
});
it("add attributes to tags according to manifest when files are in cache", async () => {
  scriptTag.setAttribute.mockClear();
  await load({
    resources: [{ url: DUMMY1, attributes: { attr1: true, attr2: "attr2 value" }, cacheOnly: true }],
    document,
  });
  await jest.runAllTimers();
  await load({
    resources: [{ url: DUMMY1, attributes: { attr1: true, attr2: "attr2 value" } }],
    document,
  });
  await jest.runAllTimers();
  expect(scriptTag.setAttribute.mock.calls.sort()).toMatchObject(
    [
      ["attr1", true],
      ["attr2", "attr2 value"],
      ["data-cappcache-src", "dummy.url1"],
      ["type", "text/javascript"],
    ].sort()
  );
});
it("adds sourceURL to scripts to allow debugging", async () => {
  scriptTag.setAttribute.mockClear();
  await load({
    resources: [{ url: DUMMY1, attributes: { attr1: true, attr2: "attr2 value" }, cacheOnly: true }],
    document,
  });
  await jest.runAllTimers();
  await load({
    resources: [{ url: DUMMY1, attributes: { attr1: true, attr2: "attr2 value" } }],
    document,
  });
  await jest.runAllTimers();
  expect(scriptTag.appendChild).toHaveBeenCalledWith(expect.stringMatching(/sourceURL/));
});
it("add attributes to tags according to manifest when files are NOT in cache", async () => {
  scriptTag.setAttribute.mockClear();
  await load({
    resources: [{ url: DUMMY1, attributes: { attr1: true, attr2: "attr2 value" } }],
    document,
  });
  await jest.runAllTimers();
  expect(scriptTag.setAttribute.mock.calls.sort()).toMatchObject(
    [["attr1", true], ["attr2", "attr2 value"], ["src", "dummy.url1"], ["type", "text/javascript"]].sort()
  );
});
it("adds tagNameWhenNotInline attributes when the element is not inline", async () => {
  scriptTag.setAttribute.mockClear();
  await load({
    resources: [{ url: DUMMY1, type: "css" }],
    document,
  });
  await jest.runAllTimers();
  expect(linkTag.setAttribute.mock.calls.sort()).toMatchObject([["href", "dummy.url1"], ["rel", "stylesheet"]].sort());
});
it("adds fontface element when there is no cache", async () => {
  scriptTag.setAttribute.mockClear();
  await load({
    document,
    resources: [
      {
        type: "fontface",
        url: "https://fonts.gstatic.com/s/spectral/v1/He_vQncVabw6pF26p40JY3YhjbSpvc47ee6xR_80Hnw.woff2",
        format: "woff2",
        localFontFamily: ["Spectral", "Spectral-Regular"],
        fallbackUrls: [
          {
            url: "https://fonts.gstatic.com/s/spectral/v1/56Lle1MfnFtd9zNafzmC3RkAz4rYn47Zy2rvigWQf6w.woff2",
            format: "woff2",
          },
        ],
        fontAttributes: {
          "unicode-range":
            "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
          "font-weight": "400",
          "font-style": "normal",
          "font-family": "'Spectral'",
        },
      },
    ],
  });
  await jest.runAllTimers();
  expect(cssTag.innerHTML).toContain("Spectral");
  expect(document.head.appendChild).toHaveBeenCalledTimes(1);
});
it("adds fontface element when there is cache", async () => {
  await scriptTag.setAttribute.mockClear();
  const resource = {
    type: "fontface",
    url: "https://fonts.gstatic.com/s/spectral/v1/He_vQncVabw6pF26p40JY3YhjbSpvc47ee6xR_80Hnw.woff2",
    format: "woff2",
    localFontFamily: ["Spectral", "Spectral-Regular"],
    fallbackUrls: [
      {
        url: "https://fonts.gstatic.com/s/spectral/v1/56Lle1MfnFtd9zNafzmC3RkAz4rYn47Zy2rvigWQf6w.woff2",
        format: "woff2",
      },
    ],
    fontAttributes: {
      "unicode-range":
        "U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215",
      "font-weight": "400",
      "font-style": "normal",
      "font-family": "'Spectral'",
    },
  };
  await load({
    document,
    resources: [{ ...resource, cacheOnly: true }],
  });
  await jest.runAllTimers();
  await load({
    document,
    resources: [resource],
  });
  await jest.runAllTimers();
  expect(cssTag.innerHTML).toContain("mock_object_url");
  expect(document.head.appendChild).toHaveBeenCalledTimes(1);
});
describe("sorts the manifest", () => {
  const { sortResources } = require("../src/sortResources");
  const getIndexOf = name => resources.findIndex(r => r.name === name);
  const resources = [
    //should move to the bottom since it has cache only
    { type: "js", name: "firstCacheOnly", cacheOnly: true },
    { type: "js", name: "secondCacheOnly", cacheOnly: true },

    { type: "js", name: "firstRegularScript", cacheOnly: false },
    { type: "js", name: "secondRegularScript", cacheOnly: false },
    { type: "js", name: "thirdRegularScript", cacheOnly: false },

    //should move to the top since this is fontface
    { type: "fontface", name: "firstFontFace", cacheOnly: false },
    { type: "fontface", name: "secondFontFace", cacheOnly: false },
  ];
  sortResources(resources);
  it("sorts it using stable sort, so that the order of the manifest is maintained", () => {
    expect(getIndexOf("firstCacheOnly")).toBeLessThan(getIndexOf("secondCacheOnly"));
    expect(getIndexOf("firstRegularScript")).toBeLessThan(getIndexOf("secondRegularScript"));
    expect(getIndexOf("secondRegularScript")).toBeLessThan(getIndexOf("thirdRegularScript"));
    expect(getIndexOf("firstFontFace")).toBeLessThan(getIndexOf("secondFontFace"));
  });
  it("places fontface at the beginning of the list", () => {
    expect(getIndexOf("firstFontFace")).toBe(0);
    expect(getIndexOf("secondFontFace")).toBe(1);
  });
  it("places cacheOnly at the bottom of the list", () => {
    expect(getIndexOf("firstCacheOnly")).toBe(resources.length - 2);
    expect(getIndexOf("secondCacheOnly")).toBe(resources.length - 1);
  });
});

it("handles complex script of both sync and async, with and without cache", async () => {
  const manifestArgs = {
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" }, cacheOnly: true },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" } },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr2 value" } },
    ],
    document,
  };
  await load(manifestArgs);
  await jest.runAllTimers();
  await load(manifestArgs);
  await jest.runAllTimers();
  expect(head.appendChild).toHaveBeenCalledTimes(4);
});
it("uses count API on IDB when loadResources is called with syncCacheOnly=true", async () => {
  const manifestArgs = {
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" }, cacheOnly: true },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" } },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr2 value" } },
    ],
    document,
  };
  load(manifestArgs, { syncCacheOnly: true });
  await jest.runAllTimers();
  load(manifestArgs, { syncCacheOnly: true });
  await jest.runAllTimers();
  for (let i = 0; i < 6; i++) {
    expect(mockIDB.registerCall.mock.calls[i]).toEqual(["count"]);
  }
});
it("adds the script in the correct order, according to the manifest", async () => {
  const manifestArgs = {
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" }, cacheOnly: true },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" } },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr3 value" } },
    ],
    document,
  };
  await load(manifestArgs);
  await jest.runAllTimers();
  await load(manifestArgs);
  await jest.runAllTimers();
  const calls = scriptTag.setAttribute.mock.calls.filter(c => c[0] === "data-cappcache-src" || c[0] === "src");
  expect(calls[0][1] === DUMMY2);
  expect(calls[1][1] === DUMMY3);
  expect(calls[2][1] === DUMMY2);
  expect(calls[3][1] === DUMMY3);
});
it("if the manifest was updated, loading script uses data url to maintain load order", async () => {
  const manifestArgs = {
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" } },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" } },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr3 value" } },
    ],
    version: "old",
    document,
  };
  await load(manifestArgs);
  await jest.runAllTimers();
  scriptTag.setAttribute.mockClear();
  scriptTag.appendChild.mockClear();
  await load(
    {
      resources: [
        manifestArgs.resources[0],
        { url: DUMMY4, attributes: { attr1: true, attr2: "attr2 value" } },
        manifestArgs.resources[1],
        manifestArgs.resources[2],
      ],
      version: "new",
      document,
    },
    { wasManifestModified: true }
  );
  await jest.runAllTimers();
  const calls = scriptTag.setAttribute.mock.calls.filter(c => c[0] === "src");
  const DATA_URL_PREFIX = /^data:text\/javascript/;
  expect(calls[0][1]).toEqual(expect.stringMatching(DATA_URL_PREFIX));
  expect(calls[1][1]).toEqual(expect.stringMatching(DATA_URL_PREFIX));
  expect(calls[2][1]).toEqual(expect.stringMatching(DATA_URL_PREFIX));
  expect(calls[3][1]).toBe(DUMMY4);
});

it("when forceLoadFromCache flag is set in the manifest, files will be fetched to indexedDB and only then added, instead of using src attribute", async () => {
  const manifestArgs = {
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" } },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" } },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr3 value" } },
    ],
    forceLoadFromCache: true,
    document,
  };
  await load(manifestArgs);
  const srcCalls = scriptTag.setAttribute.mock.calls.filter(c => c[0] === "src");
  expect(srcCalls).toHaveLength(0);
  const appendChildCalls = scriptTag.appendChild.mock.calls;
  expect(appendChildCalls).toHaveLength(3);
});
it("when forceRecaching flag is set in the argument for loadResource, resources are fetched from network and saved to db even if it is already cached", async () => {
  const manifestArgs = {
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" } },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" } },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr3 value" } },
    ],
    forceLoadFromCache: true,
    document,
  };
  await load(manifestArgs);
  scriptTag.appendChild.mockClear();
  const NEW_CONTENT = "new dummy1";
  require("./mocks/mockNetwork").configureResponse(DUMMY1, {
    content: NEW_CONTENT,
    contentType: "application/javascript",
  });
  await load(manifestArgs, { forceRecaching: true });
  jest.runAllTimers();
  const appendChildCalls = scriptTag.appendChild.mock.calls;
  expect(appendChildCalls[0][0]).toMatch(new RegExp(NEW_CONTENT));
  require("./mocks/mockNetwork").resetResponses();
});
it("when the manifest has recacheAfterVersionChange flag and the version has changed, it turns on the forceRecaching flag on load", async () => {
  const manifestArgs = (version, extraArgs = {}) => ({
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" } },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" } },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr3 value" } },
    ],
    version,
    document,
    ...extraArgs,
  });
  await load(manifestArgs(1));
  await jest.runAllTimers();
  scriptTag.appendChild.mockClear();
  scriptTag.setAttribute.mockClear();

  const NEW_CONTENT = "new dummy1";
  require("./mocks/mockNetwork").configureResponse(DUMMY1, {
    content: NEW_CONTENT,
    contentType: "application/javascript",
  });
  await load(manifestArgs(2, { forceLoadFromCache: true, recacheAfterVersionChange: true }), {
    wasManifestModified: true,
  });
  jest.runAllTimers();
  const setSrcAttributeCalls = scriptTag.setAttribute.mock.calls.filter(call => call[0] === "src");
  expect(setSrcAttributeCalls[0][1]).toMatch(new RegExp(NEW_CONTENT));
  require("./mocks/mockNetwork").resetResponses();
});
it("when a user adds onLoadDone callback as string, it is called after all scripts are done", async () => {
  window.doneCallback = jest.fn();
  const manifestArgs = () => ({
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" } },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" } },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr3 value" } },
    ],
    onLoadDone: "doneCallback()",
    document,
  });
  await load(manifestArgs());
  await jest.runAllTimers();
  expect(window.doneCallback).toHaveBeenCalled();
  window.doneCallback.mockClear();
  scriptTag.setAttribute.mockClear();
  scriptTag.appendChild.mockClear();

  //second time, with cache
  await load(manifestArgs());
  await jest.runAllTimers();
  expect(window.doneCallback).toHaveBeenCalled();
});
it("when a user adds onLoadDone callback as an function instead of string, it is called after all scripts are done", async () => {
  const doneCallback = jest.fn();
  const manifestArgs = () => ({
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" } },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" } },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr3 value" } },
    ],
    onLoadDone: doneCallback,
    document,
  });
  await load(manifestArgs());
  await jest.runAllTimers();
  expect(doneCallback).toHaveBeenCalled();
  doneCallback.mockClear();
  scriptTag.setAttribute.mockClear();
  scriptTag.appendChild.mockClear();

  //second time, with cache
  await load(manifestArgs());
  await jest.runAllTimers();
  expect(doneCallback).toHaveBeenCalled();
});
it("loadResources resolves using script in the body when some resources are added to the body", async () => {
  jest.clearAllMocks();
  const manifestArgs = () => ({
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" }, target: "head" },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" }, target: "body" },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr3 value" }, target: "head" },
    ],
    document,
  });
  await load(manifestArgs());
  await jest.runAllTimers();
  expect(require("./mocks/mockOnLoadDoneHandling").appendOnLoadScript).toHaveBeenCalledWith(
    expect.objectContaining({ elementAddedToBody: true })
  );
});
it("loadResources resolves using script in the head when all resources are added to the head", async () => {
  jest.clearAllMocks();
  const manifestArgs = () => ({
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" }, target: "head" },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" }, target: "head" },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr3 value" }, target: "head" },
    ],
    document,
  });
  await load(manifestArgs());
  await jest.runAllTimers();
  expect(require("./mocks/mockOnLoadDoneHandling").appendOnLoadScript).toHaveBeenCalledWith(
    expect.objectContaining({ elementAddedToBody: false })
  );
});
it("when a user turns on Overriding `DomContentLoaded` it triggers an event, when an onLoadDone is defined", async () => {
  global.domContentLoaded = jest.fn();
  const manifestArgs = id => ({
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" } },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" }, type: "css" },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr3 value", async: true } },
    ],
    onLoadDone: jest.fn(),
    document,
  });

  //from network
  await load(manifestArgs(1), { overrideDomContentLoaded: true });
  await jest.runAllTimers();
  expect(domContentLoaded).toHaveBeenCalled();
  jest.clearAllMocks();

  //from cache
  await load(manifestArgs(2), { overrideDomContentLoaded: true });
  await jest.runAllTimers();
  expect(domContentLoaded).toHaveBeenCalled();
});
it("when a user turns on Overriding `DomContentLoaded` it triggers an event, when an onLoadDone is not defined", async () => {
  global.domContentLoaded = jest.fn();
  const manifestArgs = id => ({
    resources: [
      { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" } },
      { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" }, type: "css" },
      { url: DUMMY3, attributes: { attr1: true, attr2: "attr3 value", async: true } },
    ],
    document,
  });
  //from network
  await load(manifestArgs(1), { overrideDomContentLoaded: true });
  await jest.runAllTimers();
  expect(domContentLoaded).toHaveBeenCalled();
  jest.clearAllMocks();

  //from cache
  await load(manifestArgs(2), { overrideDomContentLoaded: true });
  await jest.runAllTimers();
  expect(domContentLoaded).toHaveBeenCalled();
});
describe("loadResources resolves with information about the loaded resources", () => {
  it("returns an answer indicating if the resources were loaded from cache or not", async () => {
    let result = await load({
      resources: [
        { url: DUMMY1, attributes: { attr1: true, attr2: "attr2 value" } },
        {
          url: DUMMY2,
          attributes: { attr1: true, attr2: "attr2 value" },
        },
      ],
      document,
    });
    await jest.runAllTimers();
    expect(result.allFromCache).toBe(false);
    expect(result.resources).toHaveLength(2);
    expect(result.resources.every(r => r.fromCache === false)).toBe(true);

    //second run, all in cache
    result = await load({
      resources: [
        { url: DUMMY1, attributes: { attr1: true, attr2: "attr2 value" } },
        {
          url: DUMMY2,
          attributes: { attr1: true, attr2: "attr2 value" },
        },
      ],
      document,
    });
    await jest.runAllTimers();
    expect(result.allFromCache).toBe(true);
    expect(result.resources).toHaveLength(2);
    expect(result.resources.every(r => r.fromCache === true)).toBe(true);
  });
});
describe("getLoadedResources API", () => {
  it("returns a list of resources loaded in the current session", async () => {
    jest.resetModules();
    const { load, getLoadedResources } = require("../src/resourceManager"); //we need to clear the list of loaded files
    const manifestArgs = {
      resources: [
        { url: DUMMY1, attributes: { attr1: true, attr2: "attr1 value" }, cacheOnly: true },
        { url: DUMMY2, attributes: { attr1: true, attr2: "attr2 value" }, type: "css" },
        { url: DUMMY3, attributes: { attr1: true, attr2: "attr2 value" } },
      ],
      document,
    };
    await load(manifestArgs);
    const resources = getLoadedResources();
    expect(resources).toHaveLength(manifestArgs.resources.length);
    expect(resources[0].domSelector).toBe('style[data-cappcache-src="dummy.url2"]');
    expect(resources[1].domSelector).toBe('script[data-cappcache-src="dummy.url3"]');
    expect(resources[2].domSelector).toBeNull();
  });
});

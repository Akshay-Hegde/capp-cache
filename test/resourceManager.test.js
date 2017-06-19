jest.mock("../src/network", () => require("./mocks/mockNetwork"));
jest.mock("../src/id", () => ({ id: id => id }));
jest.mock("../src/indexedDB", () => require("./mocks/mockIDB").mock);
const { load } = require("../src/resourceManager");
const mockIDB = require("./mocks/mockIDB").mock;

const DUMMY1 = "dummy.url1";
const DUMMY2 = "dummy.url2";
const DUMMY3 = "dummy.url3";

const head = {
  appendChild: jest.fn(),
};
const body = {
  appendChild: jest.fn(),
};
const scriptTag = {
  setAttribute: jest.fn(),
  appendChild: jest.fn(),
};
const cssTag = {
  setAttribute: jest.fn(),
};
const linkTag = {
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
    default:
      console.error(`unable to find type ${type}`);
      return null;
  }
};

const document = {
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
  expect(mockIDB.dbData[DUMMY1]).toBeTruthy();
  expect(mockIDB.dbData[DUMMY2]).toBeTruthy();
});
it("adds elements to head by default", async () => {
  await load({ resources: [{ url: DUMMY1 }, { url: DUMMY2 }], document });
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
it("downloads to the cache cacheOnly resources", async () => {
  await load({ resources: [{ url: DUMMY1, cacheOnly: true }], document });
  await jest.runAllTimers();
  expect(mockIDB.dbData[DUMMY1]).toBeTruthy();
});
it("does not try to add blob to the DOM", async () => {
  await load({ resources: [{ url: DUMMY1, type: "blob" }], document });
  await jest.runAllTimers();
  expect(mockIDB.dbData[DUMMY1]).toBeTruthy();
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
it("adds the tags to the appropriate target");
it("appends the correct tag type");
it("prunes the DB from all files not loaded in that session");
it("add attributes to tags according to manifest when files are not in cache");

// describe("get resource URI");

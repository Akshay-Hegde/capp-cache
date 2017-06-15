jest.mock("../src/network", () => require("./mocks/mockNetwork"));
jest.mock("../src/id", () => ({ id: id => id }));
jest.mock("../src/indexedDB", () => require("./mocks/mockIDB").mock);
const resourceLoader = require("../src/resourceLoader");
const indexedDBAccess = require("../src/indexedDBAccess").default;
const closeIndexedDBAccess = require("../src/indexedDBAccess").closeConnection;
const { loadResource, getCachedFiles } = resourceLoader;
const MOCK_RESP = "mock response";

const RESOURCE_URL = "dummy.url";
const RESOURCE_URL2 = "dummy.url2";

beforeEach(() => {
  closeIndexedDBAccess();
  require("../src/indexedDB").resetDB();
});

it("rejects when a resource is not in the database", async () => {
  const idbAccess = await indexedDBAccess();
  await expect(loadResource({ indexedDBAccess: idbAccess, url: RESOURCE_URL })).rejects.toBeNull();
});

it("on the second time a resource is requested, it should be fetched from cache", async () => {
  const idbAccess = await indexedDBAccess();
  await expect(loadResource({ indexedDBAccess: idbAccess, url: RESOURCE_URL })).rejects.toBeNull();
  await jest.runAllTimers();
  const resource = await loadResource({ indexedDBAccess: idbAccess, url: RESOURCE_URL });
  await expect(resource.resource.content).toBe(MOCK_RESP);
});

it("gets the cached files in this session, without duplications", async () => {
  const idbAccess = await indexedDBAccess();
  await expect(loadResource({ indexedDBAccess: idbAccess, url: RESOURCE_URL })).rejects.toBeFalsy();
  await expect(loadResource({ indexedDBAccess: idbAccess, url: RESOURCE_URL2 })).rejects.toBeFalsy();
  await jest.runAllTimers();
  await expect(loadResource({ indexedDBAccess: idbAccess, url: RESOURCE_URL })).resolves.toBeTruthy();
  const cachedFiles = await getCachedFiles();
  await expect(cachedFiles.length).toBe(2);
});

it("with immediate flag, it fetches a resource from the web and caches the result", async () => {
  const idbAccess = await indexedDBAccess();
  const { resource } = await loadResource({ indexedDBAccess: idbAccess, url: RESOURCE_URL, immediate: true });
  expect(resource.content).toBe(MOCK_RESP);
});
it("saves the file in cache after fetching from the web", async () => {
  const idbAccess = await indexedDBAccess();
  await expect(loadResource({ indexedDBAccess: idbAccess, url: RESOURCE_URL })).rejects.toBeFalsy();
  await jest.runAllTimers();
  expect(require("../src/indexedDB").dbData[RESOURCE_URL]).toBeTruthy();
});
// it("updates ttl timestamp when loading resources", async () => {
//   expect(false).toBeTruthy();
// });

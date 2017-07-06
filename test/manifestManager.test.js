const mockNetwork = require("./mocks/mockNetwork");
jest.mock("../src/IndexedDB", () => require("./mocks/mockIDB").mock);
jest.mock("../src/network", () => mockNetwork);
jest.mock("../src/id", () => ({ id: id => id }));
jest.mock("../src/resourceManager", () => mockResourceManager);
const mockResourceManager = { load: jest.fn() };

const manifestManager = require("../src/manifestManager").default;
const mockIDB = require("./mocks/mockIDB").mock;
const MOCK_URL = "manifest.url";
beforeEach(() => {
  mockNetwork.resetResponses();
  mockIDB.resetDB();
  expect(mockIDB.dbData).toBeUndefined();
});

it("saves the manifest in cache after first run", async () => {
  let manifestResult = await manifestManager.fetchManifest(MOCK_URL, mockIDB);
  expect(manifestResult.manifest.version).toBe("1");
  await jest.runAllTimers();
  expect(mockIDB.dbData[MOCK_URL]).toEqual(expect.stringMatching(/.*version.*/));
});
it("uses the cached manifest on subsequent runs", async () => {
  await manifestManager.fetchManifest(MOCK_URL, mockIDB);
  await jest.runAllTimers();
  mockNetwork.configureResponse(MOCK_URL, {
    content: JSON.stringify({
      version: "2",
    }),
  });
  await manifestManager.fetchManifest(MOCK_URL, mockIDB);
  expect(mockResourceManager.load).toHaveBeenLastCalledWith({ version: "1" });
});
it("updates the manifest in the background", async () => {
  await manifestManager.fetchManifest(MOCK_URL, mockIDB);
  await jest.runAllTimers();
  mockNetwork.configureResponse(MOCK_URL, {
    content: JSON.stringify({
      version: "2",
    }),
  });
  await manifestManager.fetchManifest(MOCK_URL, mockIDB);
  const dbDataValue = JSON.parse(mockIDB.dbData[MOCK_URL]);
  expect(dbDataValue.version).toBe("2");
});

it("returns an appropriate response when the manifest was updated", async () => {
  await manifestManager.fetchManifest(MOCK_URL, mockIDB);
  await jest.runAllTimers();
  mockNetwork.configureResponse(MOCK_URL, {
    content: JSON.stringify({
      version: "2",
    }),
  });
  const { wasModified } = await manifestManager.fetchManifest(MOCK_URL, mockIDB);
  expect(wasModified).toBe(true);
});

it("returns an appropriate response when the manifest was NOT updated", async () => {
  await manifestManager.fetchManifest(MOCK_URL, mockIDB);
  await jest.runAllTimers();
  const { wasModified } = await manifestManager.fetchManifest(MOCK_URL, mockIDB);
  expect(wasModified).toBe(false);
});

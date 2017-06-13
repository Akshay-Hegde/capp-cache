const mockNetwork = require("./mocks/mockNetwork");
jest.mock("../src/network", () => mockNetwork);
const mockResourceManager = { load: jest.fn() };
jest.mock("../src/resourceManager", () => mockResourceManager);

const manifestManager = require("../src/manifestManager").default;
const mockIDB = require("./mocks/mockIDB").mock;
const MOCK_URL = "manifest.url";
const ABOUT_BLANK = "about:blank";
beforeEach(() => {
  mockNetwork.resetResponses();
  mockIDB.resetDB();
  expect(Object.keys(mockIDB.dbData).length).toBe(1);
});

it("saves the manifest in cache after first run", async () => {
  let manifestResult = await manifestManager.fetchManifest(MOCK_URL, ABOUT_BLANK, mockIDB);
  expect(manifestResult.manifest.version).toBe("1");
  await jest.runAllTimers();
  expect(mockIDB.dbData[ABOUT_BLANK][MOCK_URL]).toEqual(expect.stringMatching(/.*version.*/));
});
it("uses the cached manifest on subsequent runs", async () => {
  await manifestManager.fetchManifest(MOCK_URL, ABOUT_BLANK, mockIDB);
  await jest.runAllTimers();
  mockNetwork.configureResponse(MOCK_URL, {
    content: JSON.stringify({
      version: "2",
    }),
  });
  await manifestManager.fetchManifest(MOCK_URL, ABOUT_BLANK, mockIDB);
  expect(mockResourceManager.load).toHaveBeenLastCalledWith({ version: "1" });
});
it("updates the manifest in the background", async () => {
  await manifestManager.fetchManifest(MOCK_URL, ABOUT_BLANK, mockIDB);
  await jest.runAllTimers();
  mockNetwork.configureResponse(MOCK_URL, {
    content: JSON.stringify({
      version: "2",
    }),
  });
  await manifestManager.fetchManifest(MOCK_URL, ABOUT_BLANK, mockIDB);
  const dbDataValue = JSON.parse(mockIDB.dbData[ABOUT_BLANK][MOCK_URL]);
  expect(dbDataValue.version).toBe("2");
});

it("returns an appropriate response when the manifest was updated", async () => {
  await manifestManager.fetchManifest(MOCK_URL, ABOUT_BLANK, mockIDB);
  await jest.runAllTimers();
  mockNetwork.configureResponse(MOCK_URL, {
    content: JSON.stringify({
      version: "2",
    }),
  });
  const { wasModified } = await manifestManager.fetchManifest(MOCK_URL, ABOUT_BLANK, mockIDB);
  expect(wasModified).toBe(true);
});

it("returns an appropriate response when the manifest was NOT updated", async () => {
  await manifestManager.fetchManifest(MOCK_URL, ABOUT_BLANK, mockIDB);
  await jest.runAllTimers();
  const { wasModified } = await manifestManager.fetchManifest(MOCK_URL, ABOUT_BLANK, mockIDB);
  expect(wasModified).toBe(false);
});

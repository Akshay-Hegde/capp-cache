const mockIDB = require("./mocks/mockIDB").mock;
jest.mock(
  "../src/indexedDBAccess",
  jest.fn(() => {
    const db = {
      getResource: jest.fn(() => {}),
      putResource: jest.fn(() => {}),
    };
    return Promise.resolve(db);
  })
);
const ttlManager = require("../src/ttlManager");

const MOCK_URL1 = "dummy1.url";
const MOCK_URL2 = "dummy2.url";

it("updates the timestamp for recently used resources", async () => {
  ttlManager.updateTimestamp({ resources: [MOCK_URL1, MOCK_URL2] });
});
it("doesn't update resources that are not loaded", async () => {
  expect(false).toBeTruthy();
});
it("");

it("removes resources older than threshold", async () => {
  expect(false).toBeTruthy();
});
it("read thresholds from the manifest", async () => {
  expect(false).toBeTruthy();
});
it("does not remove resources below the threshold", async () => {
  expect(false).toBeTruthy();
});

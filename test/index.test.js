jest.mock("../src/resourceManager", () => ({
  load: jest.fn(() => Promise.resolve()),
}));
jest.mock("../src/eventBus", () => ({
  trigger: jest.fn(),
}));

global.document.getElementsByTagName = () => {
  return [{ dataset: { ccManifest: "mockManifestUrl" } }];
};

beforeEach(() => {
	jest.resetModules();
});

it("triggers an event when there is a newer manifest available", async () => {
  jest.mock("../src/manifestManager", () => {
    return {
      fetchManifest: jest.fn(
        () =>
          new Promise(resolve => {
            resolve({ manifest: {}, wasModified: true });
          })
      ),
    };
  });
  require("../index");
  await jest.runAllTimers();
  await jest.runAllTicks();
  return await expect(require("../src/eventBus").trigger).toHaveBeenCalled();
});

it("fetches and load the manifest on startup", async () => {
  jest.mock("../src/manifestManager", () => {
    return {
      fetchManifest: jest.fn(
        () =>
          new Promise(resolve => {
            resolve({ manifest: {}, wasModified: false });
          })
      ),
    };
  });
  require("../index");
  await jest.runAllTimers();
  expect(require("../src/manifestManager").fetchManifest).toHaveBeenCalled();
  expect(require("../src/resourceManager").load).toHaveBeenCalledTimes(0);
});

it("when the manifest changes it loads the new resources to cache", async () => {
  jest.mock("../src/manifestManager", () => {
    return {
      fetchManifest: jest.fn(
        () =>
          new Promise(resolve => {
            resolve({ manifest: {}, wasModified: true });
          })
      ),
    };
  });
  require("../index");
  await jest.runAllTimers();
  expect(require("../src/manifestManager").fetchManifest).toHaveBeenCalled();
  expect(require("../src/resourceManager").load).toHaveBeenCalledTimes(1);
});

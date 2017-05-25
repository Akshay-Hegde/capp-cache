const resourceLoader = require("../src/resourceLoader");
const mockIDB = require("./mocks/mockIDB");
const indexedDBAccess = require("../src/indexedDBAccess").default;
const mockNetwork = require("./mocks/mockNetwork").fetchResource;
const MOCK_RESP = require("./mocks/mockNetwork").MOCK_RESP;
const { loadResource , getCachedFiles} = resourceLoader;

const STORE_NAME = "store";
const RESOURCE_URL = "dummy.url";
const RESOURCE_URL2 = "dummy.url2";
beforeEach(() => global.console = { log: jest.fn() });
beforeEach(() => resourceLoader.__injectMockConfig__(mockNetwork));

it("rejects when a resource is not in the database", async () => {
    const idbAccess = await indexedDBAccess(STORE_NAME, mockIDB.mock);
    await expect(loadResource(idbAccess, RESOURCE_URL)).rejects.toBeNull();
});

it("on the second time a resource is requested, it should be fetched from cache", async () => {
    const idbAccess = await indexedDBAccess(STORE_NAME, mockIDB.mock);
	await expect(loadResource(idbAccess, RESOURCE_URL)).rejects.toBeFalsy();
	await new Promise(resolve => setTimeout(resolve));
	await expect(loadResource(idbAccess, RESOURCE_URL)).resolves.toMatchObject({
		resource: MOCK_RESP,
		fromCache: true,
	});
});

it("gets the cached files in this session, without duplications", async ()=>{
	const idbAccess = await indexedDBAccess(STORE_NAME, mockIDB.mock);
	await expect(loadResource(idbAccess, RESOURCE_URL)).rejects.toBeFalsy();
	await expect(loadResource(idbAccess, RESOURCE_URL2)).rejects.toBeFalsy();
	await new Promise(resolve => setTimeout(resolve));
	await expect(loadResource(idbAccess, RESOURCE_URL)).resolves.toBeTruthy();
	const cachedFiles = await getCachedFiles();
	await expect(cachedFiles.length).toBe(2);
});

it("with immediate flag, it fetches a resource from the web and caches the result", async () => {
    const idbAccess = await indexedDBAccess(STORE_NAME, mockIDB.mock);
    await expect(loadResource(idbAccess, RESOURCE_URL, true)).resolves.toMatchObject({
        resource: MOCK_RESP,
        fromCache: false,
    });
});
it("saves the file in cache after fetching from the web", async ()=>{
	const idbAccess = await indexedDBAccess(STORE_NAME, mockIDB.mock);
	await expect(loadResource(idbAccess, RESOURCE_URL)).rejects.toBeFalsy();
	await new Promise(resolve => setTimeout(resolve));
	expect(mockIDB.mock.mockDBInstance.mockDB.store[RESOURCE_URL]).toBeTruthy();
});

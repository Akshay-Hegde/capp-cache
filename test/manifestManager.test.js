const manifestManager = require("../src/manifestManager");
const mockIDB = require("./mocks/mockIDB");
const indexedDBAccess = require("../src/indexedDBAccess");
const STORE_NAME = "store";

it("fetches the manifest from cache", async ()=>{
	// const idbAccess = await indexedDBAccess(STORE_NAME, mockIDB.mock);
	// manifestManager.fetchManifest()
});
it("fetches the manifest from network if there is none in cache");
it("updates the manifest in the background");
it("notifies when the cache manifest was updated");
const resourceLoader = require("../src/resourceLoader");
const mockIDB = require("./mocks/mockIDB");
const indexedDBAccess = require("../src/indexedDBAccess").default;
const mockNetwork = require("./mocks/mockNetwork").fetchResource
const { loadResource } = resourceLoader;



const STORE_NAME = "store";
const RESOURCE_URL = "dummy.url";

beforeEach(() => resourceLoader.__injectNetworkMock__(mockNetwork));

it("fetches a resource from the web when not in the database", async () => {
	const idbAccess = await indexedDBAccess(STORE_NAME, mockIDB.mock);
	loadResource(idbAccess, RESOURCE_URL).then(resource=>{
		debugger;
	})
});
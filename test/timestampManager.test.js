jest.mock("../src/indexedDB", () => require("./mocks/mockIDB").mock);
jest.mock("../src/network", () => require("./mocks/mockNetwork"));
jest.mock("../src/id", () => ({ id: id => id }));
jest.mock("../src/onLoadDoneHandling", () => require("./mocks/mockOnLoadDoneHandling"));
const { load, getResourceUri, getLoadedResources } = require("../src/resourceManager");
const mockIDB = require("../src/indexedDB");
const TIMESTAMP_DB = "TIMESTAMP_HOUSEKEEPING";

const {trigger, EVENTS} = require("../src/eventBus");
const timestampManager = require("../src/timestampManager");

const RESOURCE_URL1 = "dummy1";
const RESOURCE_URL2 = "dummy2";

const SIX_MONTHS_AGO = new Date(Date.now() - 864e5 * 30 * 6);
const THREE_MONTHS_IN_SECONDS = 864e3 * 30 * 3;

global.IDBKeyRange = { upperBound: (bound) => bound };

it("updates the timestamp of a resource whenever it is loaded from cache", async ()=>{
	trigger(EVENTS.RESOURCE_ACCESS, { url: RESOURCE_URL1 });
	await jest.runAllTicks();
	await jest.runAllTimers();
	const dbData = mockIDB.dbData(TIMESTAMP_DB);
	const firstRunTime = dbData[RESOURCE_URL1];
	expect(firstRunTime instanceof Date).toBeTruthy();

	trigger(EVENTS.RESOURCE_ACCESS, { url: RESOURCE_URL1 });
	await jest.runAllTicks();
	await jest.runAllTimers();
	const secondRunTime = dbData[RESOURCE_URL1];
	expect(secondRunTime > firstRunTime).toBeTruthy();
});

it("removes old records from the resources and timestamp tables", async () => {
	await load({ resources: [{ url: RESOURCE_URL1 }, { url: RESOURCE_URL2 }] }); //just to initalize the db
	await jest.runAllTicks();
	await jest.runAllTimers();
	const timestampDB = mockIDB.dbData(TIMESTAMP_DB);
	const resourcesDB = mockIDB.dbData();
	timestampDB[RESOURCE_URL1] = SIX_MONTHS_AGO;
	timestampDB[RESOURCE_URL2] = SIX_MONTHS_AGO;
	timestampManager.schedulePrune(THREE_MONTHS_IN_SECONDS);
	await jest.runAllTicks();
	await jest.runAllTimers();
	debugger;
});
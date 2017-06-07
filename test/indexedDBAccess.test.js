const idbAccess = require("../src/indexedDBAccess").default;
const mockIDB = require("./mocks/mockIDB").mock;

const ID1 = "id1";
const ID2 = "id2";
const CONTENT_VALUE = "some content";
const DUMMY_TYPE = "dummy";
const NOT_FOUND = null;

beforeEach(() => (global.console.log = jest.fn()));

it("opens indexeddb connection", async () => {
    const db = await idbAccess("root", mockIDB);
    expect(db).toBeTruthy();
});

it("saves resource", async () => {
    const db = await idbAccess("root", mockIDB);
    await db.putResource("a", "mock content");
});

it("fetches previously saved resource", async () => {
    const db = await idbAccess("root", mockIDB);
    await db.putResource(ID1, { content: CONTENT_VALUE, contentType: "dummy" });
    const { content } = await db.getResource(ID1);
    expect(content).toEqual(CONTENT_VALUE);
});

it("removes previously saved resource", async () => {
    const db = await idbAccess("root", mockIDB);
    await db.putResource(ID1, CONTENT_VALUE);
    await db.removeResource(ID1);
    await expect(db.getResource(ID1)).rejects.toEqual(NOT_FOUND);
});
it("prunes resources that are not in the id list", async () => {
    const db = await idbAccess("root", mockIDB);
    await db.putResource(ID1, {content: CONTENT_VALUE, contentType: DUMMY_TYPE});
    await db.putResource(ID2, {content: CONTENT_VALUE, contentType: DUMMY_TYPE});
    await db.pruneDb([]);

    expect(db.getResource(ID1)).rejects.toEqual(NOT_FOUND);
    expect(db.getResource(ID2)).rejects.toEqual(NOT_FOUND);
});
it("doesn`t prune resources that are in the id list", async () => {
    const db = await idbAccess("root", mockIDB);
    await db.putResource(ID1, {content: CONTENT_VALUE, contentType: DUMMY_TYPE});
    await db.putResource(ID2, {content: CONTENT_VALUE, contentType: DUMMY_TYPE});
    await db.pruneDb([ID1]);
	const resource1 = await db.getResource(ID1);
	await expect(resource1.content).toBe(CONTENT_VALUE);
    await expect(db.getResource(ID2)).rejects.toBeDefined();
});

it(`prunes all resources when pruneDB called without any parameter`, async () => {
    const db = await idbAccess("root", mockIDB);
    await db.putResource(ID1, CONTENT_VALUE);
    await db.putResource(ID2, CONTENT_VALUE);
    await db.pruneDb();
    await expect(db.getResource(ID1)).rejects.toEqual(NOT_FOUND);
    await expect(db.getResource(ID2)).rejects.toEqual(NOT_FOUND);
});

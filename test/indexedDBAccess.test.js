const idbAccess = require("../src/indexedDBAccess").default;
const mockIDB = require("./mocks/mockIDB").mock;

const ID1 = "id1";
const ID2 = "id2";
const CONTENT_VALUE = "some content";

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
    await db.putResource(ID1, CONTENT_VALUE);
    const result = await db.getResource(ID1, CONTENT_VALUE);
    expect(result).toEqual(CONTENT_VALUE);
});

it("removes previously saved resource", async () => {
	const db = await idbAccess("root", mockIDB);
	await db.putResource(ID1, CONTENT_VALUE);
	await db.removeResource(ID1);
	const result = await db.getResource(ID1);
	expect(result).toBeUndefined();
});
it("prunes resources that are not in the id list", async ()=> {
	const db = await idbAccess("root", mockIDB);
	await db.putResource(ID1, CONTENT_VALUE);
	await db.putResource(ID2, CONTENT_VALUE);
	await db.pruneDb([]);
	expect(db.getResource(ID1)).resolves.toBeUndefined();
	expect(db.getResource(ID2)).resolves.toBeUndefined();
});
it("doesn`t prune resources that are in the id list", async ()=>{
	const db = await idbAccess("root", mockIDB);
	await db.putResource(ID1, CONTENT_VALUE);
	await db.putResource(ID2, CONTENT_VALUE);
	await db.pruneDb([ID1]);
	const id1Result = await db.getResource(ID1);
	const id2Result = await db.getResource(ID2);
	expect(id1Result).toBeDefined();
	expect(id2Result).toBeUndefined();
});

it(`prunes all resources when pruneDB called without any parameter`, async () => {
	const db = await idbAccess("root", mockIDB);
	await db.putResource(ID1, CONTENT_VALUE);
	await db.putResource(ID2, CONTENT_VALUE);
	await db.pruneDb();
	expect(db.getResource(ID1)).resolves.toBeUndefined();
	expect(db.getResource(ID2)).resolves.toBeUndefined();

});
const resetDB = () => {
  Object.keys(db).forEach(key => (key !== "uid" ? delete db[key] : "skip"));
};

const db = { uid: `${Math.random().toString().substr(2, 6)}` };

const mockIndexedDb = {
  target: {
    result: {
      transaction(storeNames, type) {
        return {
          objectStore(storeName) {
            if (!db[storeName]) {
              db[storeName] = {};
            }
            const putReq = {},
              getReq = {},
              deleteReq = {},
              openCursorReq = {};
            return {
              put({ id, content }) {
                if (type !== "readwrite") {
                  process.nextTick(() => putReq.onerror(`store was opened in mode ${type}`));
                } else {
                  db[storeName][id] = content;
                  console.log(`mockIDB: put resource "${id}", content "${content}"`);
                  process.nextTick(() => {
                    console.log(`mockIDB: put resource "${id}", content "${content}", calling onSuccess`);
                    console.log(`PUT : ${JSON.stringify(db, null, 2)}`);
                    putReq.onsuccess();
                  });
                }
                return putReq;
              },
              get(id) {
                const content = db[storeName][id] ? { content: db[storeName][id] } : null;
                const result = {
                  target: {
                    result: content,
                  },
                };
                console.log(`mockIDB: get resource "${id}", content "${content}"`);
                process.nextTick(() => {
                  console.log(`mockIDB: get resource"${id}", content "${content}", calling on success `);
                  getReq.onsuccess(result);
                });
                return getReq;
              },
              delete(id) {
                if (type !== "readwrite") {
                  process.nextTick(() => deleteReq.onerror(`store was opened in mode ${type}`));
                } else {
                  db[storeName][id] = undefined;
                  process.nextTick(() => deleteReq.onsuccess());
                }
                return deleteReq;
              },
              openCursor() {
                const keys = Object.keys(db[storeName]);
                let idx = 0;
                const nextResult = () => ({
                  target: {
                    result: idx === keys.length
                      ? null
                      : {
                          key: keys[idx++],
                          continue() {
                            process.nextTick(() => openCursorReq.onsuccess(nextResult()));
                          },
                        },
                  },
                });
                process.nextTick(() => openCursorReq.onsuccess(nextResult()));
                return openCursorReq;
              },
            };
          },
        };
      },
    },
  },
};

const req = {};
export const mock = {
  open(dbName, dbVersion) {
    const mockDBInstance = mockIndexedDb;
    process.nextTick(() => req.onsuccess(mockDBInstance));
    return req;
  },
  get dbData() {
    return db["RESOURCES"];
  },
  resetDB,
};

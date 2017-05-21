const mockIndexedDb = function() {
    const mockDB = {};
    return {
        target: {
            result: {
                transaction(storeNames, type) {
                    return {
                        objectStore(storeName) {
                            if (!mockDB[storeName]) {
                                mockDB[storeName] = {};
                            }
                            const store = mockDB[storeName];
                            const putReq = {}, getReq = {}, deleteReq = {}, openCursorReq = {};
                            return {
                                put({ id, content }) {
                                    if (type !== "readwrite") {
                                        process.nextTick(() => putReq.onerror(`store was opened in mode ${type}`));
                                    } else {
                                        store[id] = content;
                                        process.nextTick(() => putReq.onsuccess());
                                    }
                                    return putReq;
                                },
                                get(id) {
                                    const result = {
                                        target: {
                                            result: { content: store[id] },
                                        },
                                    };
                                    process.nextTick(() => getReq.onsuccess(result));
                                    return getReq;
                                },
                                delete(id) {
                                    if (type !== "readwrite") {
                                        process.nextTick(() => deleteReq.onerror(`store was opened in mode ${type}`));
                                    } else {
                                        store[id] = undefined;
                                        process.nextTick(() => deleteReq.onsuccess());
                                    }
                                    return deleteReq;
                                },
                                openCursor() {
                                    const keys = Object.keys(store);
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
};

export const mock = (function mock() {
    const req = {};
    return {
        open(dbName, dbVersion) {
            process.nextTick(() => req.onsuccess(mockIndexedDb()));
            return req;
        },
    };
})();

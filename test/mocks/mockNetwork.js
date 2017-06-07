const fetchResource = jest.fn((url, responseType = "text") => {
    const MOCK_RESP = { content: "mock response", contentType: "dummyType" };
    return new Promise((resolve, reject) => {
        console.log(`fetch resource mock`);
        resolve(MOCK_RESP);
    });
});

module.exports = {
    fetchResource,
};

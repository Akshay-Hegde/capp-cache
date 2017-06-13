const MOCK_RESPONSES = {
  "manifest.url": {
    content: JSON.stringify({
      version: "1",
    }),
  },
};
let mockResponses = { ...MOCK_RESPONSES };

const DEFAULT_RESPONSE = { content: "mock response", contentType: "dummyType" };

const fetchResource = jest.fn((url, responseType = "text") => {
  const MOCK_RESP = mockResponses[url] || DEFAULT_RESPONSE;
  return new Promise((resolve, reject) => {
    console.log(`fetch resource mock`);
    resolve(MOCK_RESP);
  });
});

module.exports = {
  fetchResource,
  configureResponse(url, response) {
    mockResponses[url] = response;
  },
  resetResponses() {
    mockResponses = { ...MOCK_RESPONSES };
  },
};

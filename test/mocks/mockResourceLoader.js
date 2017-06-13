const loadResource = ({ indexedDBAccess, url, immediate = false, isBinary = false }) => {
  const mockResource = { content: "mock resource" };
  const shouldFindResource = /exists/.test(url);
  return new Promise(resolve => {
    resolve(resolve(shouldFindResource ? mockResource : null));
  });
};
const fetchAndSaveInCache = jest.fn();

module.exports = {
  loadResource,
  fetchAndSaveInCache,
};

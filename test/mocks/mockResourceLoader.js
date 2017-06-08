const mockResponses = {

}

const loadResource = ({ indexedDBAccess, url, immediate = false, isBinary = false })=>{
	const mockResource
	const shouldFindResource = /exists/.test(url);
	return new Promise((resolve, reject) => {
	    shouldFindResource ? resolve()
	})
};
const fetchAndSaveInCache = jest.fn();


module.exports = {
	loadResource,
	fetchAndSaveInCache
}; 
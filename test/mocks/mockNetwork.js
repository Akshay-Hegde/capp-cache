export const MOCK_RESP = "mock response";

export const fetchResource = (url, responseType = "text") => {
    return new Promise((resolve, reject) => {
        console.log(`fetch resource mock`);
        resolve(MOCK_RESP);
    });
};

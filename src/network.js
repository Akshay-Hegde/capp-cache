const NO_CONTENT_TYPE = "";

export const fetchResource = (url, responseType = "text") => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = responseType;
        xhr.addEventListener(
            "load",
            function() {
                if (xhr.status === 200) {
                    const { response } = xhr;
                    resolve({
                        content: response,
                        contentType: xhr.getResponseHeader("content-type") || NO_CONTENT_TYPE,
                    });
                } else {
                    reject(xhr);
                }
            },
            false
        );
        // Send XHR
        xhr.send();
    });
};

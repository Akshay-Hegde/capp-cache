export const fetchImage = (url, responseType = "text") => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let content = null;
        xhr.open("GET", url, true);
        xhr.responseType = responseType;
        xhr.addEventListener(
            "load",
            function() {
                if (xhr.status === 200) {
                    content = xhr.response;
                    resolve(content);
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

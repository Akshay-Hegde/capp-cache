import { load } from "./src/resourceLoader";

(function init() {
    window.cappCacheResources = [
        {
            url: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js",
            loadAsync: false,
        },
        {
            url: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/locale/ar-ma.js",
        },
    ];
    load();
})();

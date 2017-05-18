import idbAccess from "./indexedDBAccess";
import { id } from "./id";
import { fetchImage } from "./network";

const RESOURCE_FETCH_DELAY = 1000;

const scheduleResourceCache = (url, db) => {
    fetchImage(url).then(content => {
        db.putResource(id(url), content);
    });
};

export function load() {
    idbAccess(window.location).then(db => {
        let resources = window.cappCacheResources || [];
        resources.push({ url: "measure.js", loadAsync: true });

        //todo: make async!
        resources.forEach(({
            url,
            type = "script",
            target = "head",
            loadAsync = true,
        }) => {
            const tag = document.createElement(type);
            db
                .getResource(id(url))
                .then(resource => {
                    console.log(`resource ${url} was in cache`);
                    tag.appendChild(document.createTextNode(resource));
                })
                .catch(err => {
                    console.log(
                        err
                            ? `failed to fetch resource from cache ${url}. error: ${err}`
                            : `resource ${url} was not in cache`
                    );
                    tag.setAttribute("src", url);
                    setTimeout(
                        () => scheduleResourceCache(url, db),
                        RESOURCE_FETCH_DELAY
                    );
                })
                .then(() => {
                    if (loadAsync) {
                        tag.setAttribute("async", "async");
                    }
                    document[target].appendChild(tag);
                });
        });

        setTimeout(
            () => {
                db.pruneDb(resources.map(resource => id(resource.url)));
            },
            3000
        );
    });
}

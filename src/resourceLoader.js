import idbAccess from "./indexedDBAccess";
import { id } from "./id";
import { fetchImage } from "./network";

const RESOURCE_FETCH_TIMEOUT = 1000;

const scheduleResourceCache = (url, db) => {
    fetchImage(url).then(content => {
        db.putResource(id(url), content);
    });
};

export function load() {
    idbAccess(window.location).then(db => {
        let resources = window.cappCacheResources || [];
        resources.push({ url: "measure.js" });

        //todo: make async!
        resources.forEach(({ url, type = "script", target = "head" }) => {
            const tag = document.createElement(type);
            db
                .getResource(id(url))
                .then(resource => {
                    console.log(`resource ${url} was in cache`);
                    tag.appendChild(document.createTextNode(resource));
                })
                .catch(err => {
                    console.log(
                        `failed to fetch resource from cache ${url} with error ${err}`
                    );
                    tag.setAttribute("src", url);
                    setTimeout(
                        () => scheduleResourceCache(url, db),
                        RESOURCE_FETCH_TIMEOUT
                    );
                })
                .then(() => {
                    document[target].appendChild(tag);
                });
        });
    });
}

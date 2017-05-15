import idbAccess from "./indexedDBAccess";
import {id} from './id';
import {fetchImage} from './network';

const RESOURCE_FETCH_TIMEOUT = 1000;

const scheduleResourceCache = (url, db) => {
	fetchImage(url)
		.then(content => {
			db.putResource(id(url), content);
		});
};

export async function load() {
	debugger;
    const db = await idbAccess("myPage");
    const resources = window.cappCacheResource || [{ url: "dummy.js" }];

    //todo: make async!
    resources.forEach(({ url, type = "script", target = "head" }) => {
	    const tag = document.createElement(type);
	    db.getResource(id(url))
		    .then(resource=>{
			    console.log(`resource ${url} was found, adding to page`);
			    tag.appendChild(document.createTextNode(resource));
		    })
		    .catch(err=>{
			    console.log(`failed to fetch resource from cache ${url} with error ${err}`);
			    tag.setAttribute("src", url);
			    setTimeout(() => scheduleResourceCache(url,db),RESOURCE_FETCH_TIMEOUT);
		    })
		    .then(()=>{
			    document[target].appendChild(tag);
		    })
	    ;
    });
}



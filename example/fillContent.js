document.getElementById("content").innerHTML = `
<h1>Thanks for checking out CappCache!</h1>
    <p>Open your dev tools console to check what's happening under the hood.</p>
    <p>Take a look at the elements panel. All scripts and style tags are added by CappCache.
        After first load turn off your connectivity and reload, everything will still work.
    </p>
`;

document.addEventListener("DOMContentLoaded", e => {
	console.log(`Document Got DOMContentLoaded`);
});
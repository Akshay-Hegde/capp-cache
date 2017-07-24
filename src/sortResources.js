export function sortResources(resources) {
	resources.forEach((r, index) => (r._index = index));
	resources.sort((r1, r2) => {
		if (r1.type === "fontface" && r2.type !== "fontface") {
			return -1;
		}
		if (r2.type === "fontface" && r1.type !== "fontface") {
			return 1;
		}
		if (r1.cacheOnly && !r2.cacheOnly) {
			return 1;
		}
		if (r2.cacheOnly && !r1.cacheOnly) {
			return -1;
		}
		return r1._index - r2._index;
	});
	resources.forEach((r, index) => (r._index = index));
}

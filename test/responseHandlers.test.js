const { handleResponse } = require("../src/responseHandlers");

it("escapes # when the response is svg", () => {
	const SVG_CONTENT = `<use xlink:href=\"#btNuzo4gP\" opacity=\"1\" fill=\"#666666\" fill-opacity=\"0.66\"></use>`;
	const handledResponse = handleResponse({
		contentType: "image/svg+xml", content: SVG_CONTENT
	});
	expect(handledResponse.content.length).toBeGreaterThan(SVG_CONTENT.length);
	expect(handledResponse.content.indexOf("#")).toBe(-1);
});

it("doesn't change response that it shouldn't", () => {
	const JS_CONTENT = `console.log("hello world #");`;
	const handledResponse = handleResponse({
		contentType: "application/javascript", content: JS_CONTENT
	});
	expect(handledResponse.content).toEqual(JS_CONTENT);
});
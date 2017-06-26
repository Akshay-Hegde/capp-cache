export default {
  js: {
    tagName: "script",
    contentFetchKey: "src",
    attributes: {
      type: "text/javascript",
    },
    setElementContentFunc(tag, documentTarget, content) {
      tag.appendChild(documentTarget.createTextNode(content));
    },
    canAddToDom: true,
  },
  css: {
    tagName: "style",
    contentFetchKey: "href",
    attributes: {
      type: "text/css",
    },
    tagNameWhenNotInline: "link",
    attributesWhenNotInline: {
      rel: "stylesheet",
    },
    setElementContentFunc(tag, documentTarget, content) {
      tag.innerHTML = content;
    },
    canAddToDom: true,
  },
  blob: {
    canAddToDom: false,
    attributes: {},
  },
	link: {
  	tagName: "link",
		contentFetchKey: "href",
		canAddToDom: true,
		setElementContentFunc(tag, documentTarget, content) {
			tag.href = URL.createObjectURL(content);
		},
		attributes: {},
		defaultToBinary: true,
	}
};

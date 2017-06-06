export default {
    js: {
        tagName: "script",
        contentFetchKey: "src",
        attributes: {
            type: "text/javascript",
        },
        appendTextContent(tag, documentTarget, content) {
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
        appendTextContent(tag, documentTarget, content) {
            tag.innerHTML = content;
        },
        canAddToDom: true,
    },
    blob: {
        canAddToDom: false,
        attributes: {},
    },
};

export default {
    script: {
        tagName: "script",
        contentFetchKey: "src",
        attributes: {
            type: "text/javascript",
        },
        appendTextContent(tag, documentTarget, content) {
            tag.appendChild(documentTarget.createTextNode(content));
        },
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
    },
};

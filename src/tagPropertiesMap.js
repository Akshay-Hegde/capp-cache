export default {
    script: {
        tagName: "script",
        contentFetchKey: "src",
        props: {
            type: "text/javascript",
        },
        appendTextContent(tag, documentTarget, content) {
            tag.appendChild(documentTarget.createTextNode(content));
        },
    },
    css: {
        tagName: "style",
        contentFetchKey: "href",
        props: {
            type: "text/css",
        },
        tagNameWhenNotInline: "link",
        propsWhenNotInline: {
            rel: "stylesheet",
        },
        appendTextContent(tag, documentTarget, content) {
            tag.innerHTML = content;
        },
    },
};

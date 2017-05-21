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
        tagName: "link",
        contentFetchKey: "href",
        props: {
            rel: "stylesheet",
        },
        appendTextContent(tag, documentTarget, content) {
            tag.innerHTML = content;
        },
    },
};

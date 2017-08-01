const appendOnLoadScript = require("../src/onLoadDoneHandling").appendOnLoadScript;

const documentTarget = {
  createElement: jest.fn(() => ({})),
  head: {
    appendChild: jest.fn(),
  },
  body: {
    appendChild: jest.fn(),
  },
};

beforeEach(() => {
  window.cappCache = {};
});

it("when elementAddedToBody is true, the script is added to the body", async () => {
  appendOnLoadScript({ document: documentTarget, elementAddedToBody: true });
  expect(documentTarget.body.appendChild).toHaveBeenCalled();
});
it("when elementAddedToBody is false, the script is added to the head", async () => {
  appendOnLoadScript({ document: documentTarget, elementAddedToBody: false });
  expect(documentTarget.head.appendChild).toHaveBeenCalled();
});
it("when overrideDomContentLoaded is true, the script will trigger domContentLoaded event", async () => {
  appendOnLoadScript({ document: documentTarget, elementAddedToBody: false, overrideDomContentLoaded: true });
  expect(documentTarget.head.appendChild.mock.calls[0][0].src).toEqual(expect.stringMatching(/DOMContentLoaded/));
});
it("when overrideDomContentLoaded is true, the script will trigger domContentLoaded event", async () => {
  appendOnLoadScript({ document: documentTarget, elementAddedToBody: false, overrideDomContentLoaded: true });
  expect(documentTarget.head.appendChild.mock.calls[0][0].src).toEqual(expect.stringMatching(/DOMContentLoaded/));
});

/* global jest, it, beforeEach, expect, afterEach */

beforeEach(() => {
    global.console.log = jest.fn();
    global.console.warn = jest.fn();
    global.console.error = jest.fn();
    jest.clearAllMocks();
    jest.resetModules();
});

afterEach(() => {
    expect(global.console.warn).not.toHaveBeenCalled();
    expect(global.console.error).not.toHaveBeenCalled();
});

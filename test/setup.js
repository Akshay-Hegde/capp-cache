/* global jest, it, beforeEach */

beforeEach(() => {
	global.console.log = jest.fn();
	global.console.warn = jest.fn();
	global.console.error = jest.fn();
	jest.clearAllMocks();
});

afterEach(() => {
	expect(global.console.warn).not.toHaveBeenCalled();
	expect(global.console.error).not.toHaveBeenCalled();
});
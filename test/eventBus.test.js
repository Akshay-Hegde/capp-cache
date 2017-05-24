const eventBus = require("../src/eventBus");

const EVENT = "event";
const EVENT2 = "event2";

it("can register to event", () => {
	const func = jest.fn();
	eventBus.on(EVENT, func);
	eventBus.trigger(EVENT);
	expect(func).toBeCalled();
});

it("multiple listeners can register to event", () => {
	const func1 = jest.fn();
	const func2 = jest.fn();
	eventBus.on(EVENT, func1);
	eventBus.on(EVENT, func2);
	eventBus.trigger(EVENT);
	expect(func1).toBeCalled();
	expect(func2).toBeCalled();
});

it("multiple events can be registered", () => {
	const func1 = jest.fn();
	const func2 = jest.fn();
	eventBus.on(EVENT, func1);
	eventBus.on(EVENT2, func2);
	eventBus.trigger(EVENT);
	eventBus.trigger(EVENT2);
	expect(func1).toBeCalled();
	expect(func2).toBeCalled();
});


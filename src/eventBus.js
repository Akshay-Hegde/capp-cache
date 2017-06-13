const events = {};

export const on = (eventName, handler) => {
  if (events[eventName] === undefined) {
    events[eventName] = [];
  }
  events[eventName].push(handler);
};

export const trigger = eventName => {
  if (events[eventName] !== undefined) {
    events[eventName].forEach(handler => handler());
  }
};

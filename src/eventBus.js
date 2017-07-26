const events = {};

export const EVENTS = {
  RESOURCE_ACCESS: "resource/access",
};

export const on = (eventName, handler) => {
  if (events[eventName] === undefined) {
    events[eventName] = [];
  }
  events[eventName].push(handler);
};

export const trigger = (eventName, data) => {
  if (events[eventName] !== undefined) {
    events[eventName].forEach(handler => handler(data));
  }
};

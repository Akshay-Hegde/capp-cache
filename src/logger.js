export const LOG_LEVELS = {
  log: 1,
  warn: 2,
  error: 3,
};

let _logLevel = LOG_LEVELS.warn;

const logCommand = (level, idx, args) => {
  if (idx >= _logLevel) {
    console[level].apply(console, args);
  }
};

export function log() {
  logCommand("log", 1, arguments);
}
export function warn() {
  logCommand("warn", 2, arguments);
}
export function error() {
  logCommand("error", 3, arguments);
}

export const setLogLevel = logLevel => {
  _logLevel = logLevel;
};

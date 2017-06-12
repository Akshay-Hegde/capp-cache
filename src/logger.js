export const LOG_LEVELS = {
    log: 1,
    warn: 2,
    error: 3,
};

let _logLevel = LOG_LEVELS.warn;

const logCommand = (level, idx, args) => {
    if (level <= _logLevel) {
        console[level].apply(console, args);
    }
};

export const log = () => {
    logCommand("log", 1, arguments);
};
export const warn = () => {
    logCommand("warn", 2, arguments);
};
export const error = () => {
    logCommand("error", 3, arguments);
};

export const setLogLevel = logLevel => {
    _logLevel = logLevel;
};

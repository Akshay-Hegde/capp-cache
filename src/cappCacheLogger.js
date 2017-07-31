export const LOG_LEVELS = {
  log: 1,
  warn: 2,
  error: 3,
};

let _logLevelIndex = LOG_LEVELS.warn;
let perfAvailable;

const logCommand = (levelName, levelIndex, args) => {
  if (levelIndex >= _logLevelIndex) {
    console[levelName].apply(console, args);
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

const checkIfPerformanceAvailable = () => {
  perfAvailable = !!(LOG_LEVELS.log && window.performance && window.performance.measure);
};
checkIfPerformanceAvailable();

function perfMeasure(name, marker1, marker2) {
  isDetailedLog() && window.performance.measure(name, marker1, marker2);
}

export function perfMark(marker) {
  isDetailedLog() && window.performance.mark(marker);
}

export function perfMarkEnd(name, marker1, marker2) {
  if (isDetailedLog()) {
    const markerEnd = marker2 || marker1 + " - end";
    perfMark(markerEnd);
    perfMeasure(name, marker1, markerEnd);
  }
}

export const setLogLevel = logLevel => {
  _logLevelIndex = logLevel;
  checkIfPerformanceAvailable();
};

const timers = {};
export function logSince(timer, message) {
  if (timers[timer] === undefined) {
    timers[timer] = performance && performance.now();
  }
  log(`timing: (${performance.now() - timers[timer]}) ${message}`);
}

export function isDetailedLog() {
	return _logLevelIndex === LOG_LEVELS.log;
}
window.performance.mark('end');
window.performance.measure('load', 'start', 'end');
const duration = window.performance.getEntriesByName('load', 'measure')[0].duration;
console.log(`Script file was loaded successfully in ${duration} ms`);

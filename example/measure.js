window.performance.mark("capp-cache-end");
window.performance.measure("capp-cache-load", "capp-cache-start", "capp-cache-end");
const duration = window.performance.getEntriesByName("capp-cache-load", "measure")[0].duration;
console.log(`Script file was loaded successfully in ${duration} ms`);

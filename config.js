//
// config.js
//
// Sort of a generic module I created for another project.
// Handles loading of the JSON5 formatted config file
//

// Standard IIFE (commonly pronounced "iffy")
// (function() {
//   // statements...
// })();
// ... or the weird arrow function equivilent
// (() => {
//     // statements...
// })();
//
//
//
let config = {};
export default config;
const config_file = "panicle.json5";
let r = {};
try {
    r = await fetch(config_file);
} catch (e) {
    throw (e);
}
if (!r.ok) {
    console.error(e);
    const m = `Unable to load config: ${r.message}`;
    alert(m);
    throw new Error(m);
}
let j = await r.text();
let headers = {};
for (var pair of r.headers.entries()) {
    headers[pair[0]] = pair[1];
}
// If we received JSON, parse it.
try {
    config = JSON5.parse(j);
} catch (e) {
    if (e instanceof SyntaxError) {
        console.error("Config file parsing error:", e.message);
    } else {
        console.error("Unexpected config error:", e);
    }
    throw e;
} 
console.log(config);

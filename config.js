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
const config_file = "panicle.json5";
let r;
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
try {
    config = JSON5.parse(j);
} catch (e) {
    if (e instanceof SyntaxError) {
        console.error("Config file parsing error:", e.error);
    } else {
        console.error("Unexpected config error:", e);
    }
    throw e;
} 

function addLinks(links) {
    // FIXME:  if empty object or undefined, hide "Links"
    for (var key in links) {
        let link = links[key];
        let aLli = document.createElement('li');
        let aLa = document.createElement('a');
        aLa.className = 'dropdown-item';
        aLa.setAttribute('href', link.url);
        aLa.setAttribute('target', '_new');
        aLa.textContent = link.name || key;
        if (link.tooltip) {
            aLa.setAttribute('data-bs-toggle', 'tooltip');
            aLa.setAttribute('data-bs-placement', 'top');
            aLa.setAttribute('title', link.tooltip);
        }
        aLli.appendChild(aLa);
        try {
            let el = document.getElementById('links_dropdown');
            // ROADMAP:  Explicitly create the 'links_dropdown'
            //           element if it down not already exist.
            el.appendChild(aLli);
        } catch (error) {
            console.error("Error in addLinks: ", error);
        }
    }
}

// Add links if they exist.  If they don't exist, we should hide "Links"
if (config.Links) {
    addLinks(config.Links);
} else {
    const el = document.getElemeentById('links_dropdown');
    if (el) { el.classList.add("d-none"); }
}

// Do the logo
if (config.Logo) {
    let el = document.getElementById('navbar_logo');
    if (el) {
        el.innerHTML = config.Logo;
    }
}

// Do the <title>
if (config.Title) {
    document.title = config.Title;
}
export default config;

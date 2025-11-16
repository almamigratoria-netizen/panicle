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
    console.error(`fetch ${config_file} failed hard: `, e);
    console.error(e);
    throw(e);
}
if (!r.ok) {
    const m = `${config_file}: (${r.status})${r.statusText}`;
    console.error(m);
    throw(m);
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
    // if empty object or undefined, hide "Links"
    if (!links || Object.keys(links).length == 0) {
        let el = document.getElementById('links_dropdown').parent;
        el.remove();
        return;
    }
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
    const el = document.getElementById('navbar_logo');
    if (el) {
        el.innerHTML = config.Logo;
    }
}
// Is there a PluCodeRef?
async function geolocate(query) {
    NOSM='https://nominatim.openstreetmap.org/search'
    let qs = encodeURIComponent(query);
    const url = `${NOSM}?q=${qs}&format=jsonv2`;

    try {
        const response = await fetch(url);
        const j = response.json();
        return (j[0].lat, j[1].lon);
    } catch (e) {
        console.log(`${e.name} ${e.message}`);
        return null;
    }
}
try {
    const j = await geolocate(config.PlusCodeRef);
    if (j) {
        config.PlusCodeRef = j;
    }
} catch (e) { };


// Do the <title>
if (config.Title) {
    document.title = config.Title;
}
export default config;

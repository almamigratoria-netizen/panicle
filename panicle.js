//
// panicle.js
//
// Contains the scripts that make it go.
//
// ROADMAP:  Smaller code files.  Modules, or at least IEFE's to make it
//           easier to avoid namespace pollution.  It's lazy, but it's
//           effective.

// import * as L from './libs/leaflet/dist/leaflet-src.esm.js';
// See if we can make leaflet-sidebar-v2 module happy.
// Even better, make the sidebar a leaflet control
// Even even better, make the navbar a leaflet control.

// Get and parse the config file
// import JSON5 from "./libs/json5/json5.min.js";
import config from "./config.js";
// Add click handlers to items on the navbar
import navbar from "./navbar.js";
import L from "./libs/leaflet/dist/leaflet.js";
import SVGMarker from "./js/SVGMarker.js";

async function Ajax(method, url) {
    // ROADMAP:  Add a timeout (AbortController)
    let response;
    try {
        response = await fetch(url);
    } catch(e) {
        console.error(`fetch ${url}: ${e.message}`);
        return null;
    }
    if (!response.ok) {
        console.error(`fetch ${url}: ${response.statusText}`);
        return null;
    }
    let j = await response.text();
    // Try to parse as JSON, return text on exception
    try {
        const j5 = JSON5.parse(j);
        j = j5;
    } catch (error) {
        console.warn(error.message);
    }
    return j;
}

// Load data from JSON[5] files specified in the config file
async function Load_Data(key, s) {
    // FIXME:  Figure out how to convert Open Location codes
    try {
        let o = await Ajax('GET', s);
        let A = [];

        const defaultMarker = o.defaultMarker || {};

        for (const item in o) {
            // This isn't a marker, so move on
            if (item == "defaultMarker") { continue; };
            let d = o[item];

            // the "marker" option
            let markerOpts = {};
            if (d.marker) {
                markerOpts = { ...defaultMarker, ...d.marker};
            }
            let m = new SVGMarker(d.Location, markerOpts);

            // Bind a popup
            const a = document.createElement('a');
            a.setAttribute('target', '_new');
            if (d.Link) { a.setAttribute('href', d.Link); }
            a.textContent = item;
            m.bindPopup(a);

            // Once we have the marker built, add it to our array
            A.push(m);
        }
        return new L.LayerGroup(A);
    } catch(e) {
        console.error(`Load_Data(${key},${s}): error ${e.message}: stack ${e.stack}`);
    }
}

// I envision this as being for bus routes, but use your
// imagination, I guess.
async function Load_geoJSON(key, conf) {
    let o;
    try {
        o = await Ajax('GET', conf.file);
        const g_style = conf.style || {};
        const m = new L.GeoJSON(o, g_style);
        let text = key;
        if (conf.Link) {
            text = "<a href=" + conf.Link + ">"
            text = text + key + "</a>"
        }
        m.bindPopup(text);
        return m;
    } catch(e) {
        const m = `Error loading geoJSON file ${conf.file}: ${e.message}`;
        console.error(m);
        return {};
    }
}

async function Load_Map() {
    let map = new L.Map('map');

    // By default we center the map in Asuncion, Paraguay.  But that
    // can be tweaked using the config file.
    let lat = -25.30;
    let lon = -57.58;
    if (config.Center) {
        lat = config.Center[0];
        lon = config.Center[1];
    }
    map.setView([lat, lon], 15);

    // Config might want a list of map layers
    const OSMUrl = 'https://{s}.tile.osm.org/{z}/{x}/{y}.png';
    const OSM = new L.TileLayer(OSMUrl, {detectRetina: true});
    OSM.addTo(map);

    // Create a layerGroup object (lgo) that has key:value pairs contaiing
    // the name of the layer and the layer itself
    let lgo = {};    // layer group object
    if (config.Data) {
        for (var key in config.Data) {
            // Create layer group for each data file
            let layer = await Load_Data(key, config.Data[key]);
            if (layer && Object.keys(layer).length) {
                lgo[key] = layer;
            }
        }
    }
    if (config.GeoJSON) {
        for (var key in config.GeoJSON) {
            let layer = await Load_geoJSON(key, config.GeoJSON[key]);
            if (layer && Object.keys(layer).length) {
                lgo[key] = layer;
            }
        }
    }
    if (Object.keys(lgo).length) {
        const opts = {
            // Should evaluate as true on a mobile device
            collapsed: !!(navigator.maxTouchPoints > 0),
            hideSingleBase: true,
        };
        const layerControl = new L.Control.Layers(null, lgo, opts);
        layerControl.addTo(map);
    }
    return map;
}

let map = await Load_Map();

async function load_weather() {
    // find a way to not load on mobile
    if (!!config.Weather && !(navigator.maxTouchPoints > 0)) {
        let OM_url = "./js/leaflet.OpenMeteo.mjs";
        let mod = await import(OM_url);
        new mod.OpenMeteo().addTo(map);
    }
}
load_weather();


// For this to work, need to import at least one glyphicon css file
let options = {
    glyph: 'bx-bed-alt',
    color: 'darkblue',
}
let marker = new SVGMarker([-25.287687,-57.633063], options).bindPopup("Hostel Patagonia");
marker.addTo(map);


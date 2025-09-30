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
import config from "./config.js";
// Add click handlers to items on the navbar
import navbar from "./navbar.js";

// As written, this function throws error.  We might want to catch
// them internally so this will be easier to put in a module.
async function Ajax(method, url, options={}) {
    let fetch_options = options || {};
    if (method.toLowerCase() == 'post') {
        // jwt = localStorage.getItem('jwt_token');
        // fetch_options.headers = {'Authorization': 'Bearer ' + jwt};
        fetch_options.method = 'post';
        fetch_options.body = options.body;
    }
    // ROADMAP:  Add a timeout (AbortController)
    const response = await fetch(url, fetch_options);
    if (!response.ok) {
        // this means the rquest completes poorly.
        const e = {
            title: 'fetch error',
            message: response.statusText || 'Unknown error',
        };
        console.error(e);
        throw new Error(e);
    }
    let j = await response.text();

    // convert weird response.headers object to normal object
    let headers = {};
    for (var pair of response.headers.entries()) {
        headers[pair[0]] = pair[1];
    }
    // If we received JSON, parse it.
    if (headers['content-type'].startsWith('application/json')) {
        try {
            const j5 = JSON5.parse(j);
            j = j5;
        } catch (error) {
            console.error("Error parsing json", url);
            console.error(error.message);
        }
    }
    return j;
}

// Load data from JSON[5] files specified in the config file
async function Load_Data(key, s) {
    // FIXME:  Figure out how to convert Open Location codes
    //         (aka Google Plus Codes).  See https://plus.codes
    //         For reference, Google's AI says Asuncion Paraguay is
    //         -25.2637° latitud sur, -57.5759° longitud oeste, which
    //         I'm (currently) at 5864P968+VQ, or a P968+VQ, Asuncion Paraguay
    //         OK... block 58 is this region of South America, not sure what
    //         the 64 means, but I think it's square 64 of box 58.
    try {
        let o = await Ajax('GET', s);
        let A = [];

        const defaultMarker = o.defaultMarker || {};

        for (var key in o) {
            // This isn't a marker, so move on
            if (key == "defaultMarker") { continue; };

            let d = o[key];

            // the "marker" option
            let custom_icon = new L.Icon.Default();
            if (d.marker) {
                const m = {...defaultMarker, ...d.marker};
                // FIXME: Turns out I don't like ExtraMarkers much.
                // Find a better library
                custom_icon = new L.ExtraMarkers.icon(m);
            }
            let m = new L.Marker(d.Location, {icon: custom_icon});

            // the "url" option
            let text = key;
            if (d.Link) {
                text = "<a target=\"_new\" href=" + d.Link + ">"
                text = text + key + "</a>"
            }
            m.bindPopup(text);

            // Once we have the marker built, add it to our array
            A.push(m);
        }
        return new L.LayerGroup(A);
    } catch(e) {
        console.error("Load_Data: error = ", e);
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
            if (Object.keys(layer).length) {
                lgo[key] = layer;
            }
        }
    }
    if (config.GeoJSON) {
        for (var key in config.GeoJSON) {
            let layer = await Load_geoJSON(key, config.GeoJSON[key]);
            if (Object.keys(layer).length) {
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

// For this to work, need to import at least one glyphicon css file
// FIXME:  We should be riding the wave and use SVG's instead.
const testicon = new L.ExtraMarkers.icon({
    icon: 'bx-bed-alt',
    markerColor: 'blue',
    shape: 'square',
    prefix: 'bx,'
});
let marker = new L.Marker([-25.287687,-57.633063], {icon:testicon}).bindPopup("Hostel Patagonia");
marker.addTo(map);

if (!!config.Weather) {
    new L.Control.OpenMeteo().addTo(map);
}


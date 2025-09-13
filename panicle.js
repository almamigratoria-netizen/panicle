//
// panicle.js
//
// Contains the scripts that make it go.
//
// ROADMAP:  Have this import modules like "config.js" and
//          "map.js", maybe make the whole thing an iffy

// import * as L from './libs/leaflet/dist/leaflet-src.esm.js';
// See if we can make leaflet-sidebar-v2 module happy.
// Even better, make the sidebar a leaflet control
// Even even better, make the navbar a leaflet control.


// This works, but we might want to tweak it a bit.
// import config from "./config.js";
// console.log("back from config.js: ", config);

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
    // console.debug("Ajax headers = ", headers);    
    // If we received JSON, parse it.
    if (headers['content-type'] == 'application/json') {
        try {
            const j5 = JSON5.parse(j);
            j = j5;
        } catch (error) {
            console.error("Error parsing ", url);
            console.error(error);
            throw error;
        }
    }
    return j;
}

////////////////////////////////////////////////////////////////////////////
//
//  Load_Config_JSON() ==> (nothing)
//
//      Loads the file panicle.json5 (found in this directory)
//      Creates and populates the 'config' object which holds the
//      global config values.
//
function Load_Config() {
    function addLinks(links) {
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

    // Have to load the config synchronous, not async
    // otherwise our config values will not exists by 
    // the time the other script files need them.
    //
    // FIXME:  To avoid the depecation notice, refactor this
    //     (async function() {
    //         // Asynchronous operations here
    //         await somePromise();
    //        console.log("Anonymous async function executed.");
    //     })();
    let r = new XMLHttpRequest();
    let url = "./panicle.json5";
    r.open('GET', url, false);
    r.send(null);
    if (r.status == 200) {
        window.config = {}; // explicitly create global object
        try {
            config = JSON5.parse(r.responseText);
            // Explicitly export global.  I know we frown on it.
            window.config = config;
            if (config.Links) {
                for (var key in config.Links) {
                    let link = config.Links[key];
                    if (link.url) {
                        let s = link.url;
                        s = s.replace('${host}', document.location.host);
                        config.Links[key].url = s;
                    }
                 }
                 addLinks(config.Links);
            }
        } catch (e) {
            console.error("Error parsing ", url, ": ", e)
        }
    } else {
        console.error("Unable to load config file");
    }
    if (config.Logo) {
        let el = document.getElementById('navbar_logo');
        if (el) {
            el.innerHTML = config.Logo;
        }
    }
    if (config.Title) {
        document.title = config.Title;
    }
}

// Load data from JSON5 files specified in the "Data" section of the
// config file.  Loads async, creates the searchable list, creates the 
// layergroup, and creates the (Photo)Markers.
// FIXME:  Failure to load one data file shouldn't stop the app.
//         Should keep going with the other files.
//         Something seems wrong with our try/catch.
async function Load_Data(key, s) {
    // console.log("key = ", key, "Stuff =", s);
    // console.log("map = ", map);
    try {
        let o = await Ajax('GET', s);
        let A = [];
        for (var key in o) {
            // if (!verify_key(key)) {break;}
            let d = o[key];
            let custom_icon = new L.Icon.Default();
            // handle the "marker" option
            if (d.marker) {
                custom_icon = L.ExtraMarkers.icon(d.marker);
            }

            let m = L.marker(d.Location, {icon: custom_icon});
            // handle the "url" option
            let text = key;
            if (d.Link) {
                text = "<a href=" + d.Link + ">"
                text = text + key + "</a>"
            }
            m.bindPopup(text);

            // Once we have the marker built, add it to our array
            A.push(m);
        }
        return L.layerGroup(A);
    } catch(e) {
        console.error("Load_Data: error = ", e);
    }
}

// I envision this as being for bus routes, but use your
// imagination, I guess.
async function Load_geoJSON(key, conf) {
    try {
        let o = await Ajax('GET', conf.file);
        const g_style = conf.style || {};
        const m = L.geoJSON(o, g_style);
        // we actually want to add this to the layer control, but...
        // m.addTo(map);
        let text = key;
        if (conf.Link) {
            text = "<a href=" + conf.Link + ">"
            text = text + key + "</a>"
        }
        m.bindPopup(text);
        return m;
    } catch(e) {
        throw(e);
    }
}

async function Load_Map() {
    // FIXME:
    // Problem with container height.  Should be (viewscreen - navbar)
    // and it appears to be (viewscreen).
    // This may be a problem with how I've got my HTML.
    // Set some map options (FIXME: allow tweaks in the config)
    let map = L.map('map');

    // By default we center the map in Asuncion, Paraguay.  But that
    // can be tweaked using the config file.
    let lat = -25.30;
    let lon = -57.58;
    if (config.Center) {
        lat = config.Center[0];
        lon = config.Center[1];
    }
    map.setView([lat, lon],14);

    // Config might want a list of map layers
    const OSMUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const OSM = L.tileLayer(OSMUrl, {
        attribution: 'Add Attribution',
    });
    OSM.addTo(map);

    // Create a layerGroup object (lgo) that has key:value pairs contaiing
    // the name of the layer and the layer itself
    let lgo = {};    // layer group object
    if (config.Data) {
        // Load the data and add it to the layer control
        // Dump it in tht list so we can sort/search
        //
        for (var key in config.Data) {
            // Create layer group for each data file
            let lg = await Load_Data(key, config.Data[key]);
            lgo[key] = lg;
        }
        // const layerControl = L.control.layers(null, lgo, opts);
        // layerControl.addTo(map);
    }
    if (config.GeoJSON) {
        for (var key in config.GeoJSON) {
            console.log("Need to load GeoJSON: ", key); 
            let lg = await Load_geoJSON(key, config.GeoJSON[key]);
            lgo[key] = lg;
        }
    }
    // There should be a better way to check if an object is empty...
    if (Object.keys(lgo).length) {
        const opts = {
            collapsed: false,
            hideSingleBase: true,
        };
        const layerControl = L.control.layers(null, lgo, opts);
        layerControl.addTo(map);
    }
    return map;
}


// We're at the top level of a module.  Maybe we should
// 'await Load_Config' or something and eliminate the syncronous XMLHttp.
Load_Config();
let map = await Load_Map();

// Actually not where hostel patagonia is located.  Just here
// for illustration purposes, and also so we can play with
// alternative markers (awesome-markers, extramarkers, etc);
var center = map.getCenter();
// For this to work, need to import font-awesome 4 or 5 CSS
var testicon = L.ExtraMarkers.icon({
    icon: 'bx-bed-alt',
    markerColor: 'blue',
    shape: 'square',
    prefix: 'bx,'
});
var marker = L.marker([-25.287687,-57.633063], {icon:testicon}).bindPopup("Hostel Patagonia");
marker.addTo(map);

// Also check out this one:  Has some advantages over BootLeaf
// https://8to5developer.github.io/leaflet-custom-searchbox/


// Also if we create controls, think about this:
// Eliminates the need for a separate CSS file, but still makes
// it easy to edit the CSS.  A performance hit, but we
// can do it async.
//    const styleElement = document.createElement('style');
//    styleElement.innerHTML = `
//        .my-dynamic-class {
//            color: red;
//            font-size: 18px;
//        }
//    `;
//    document.head.appendChild(styleElement);

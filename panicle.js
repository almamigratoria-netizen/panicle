//
// panicle.js
//
// Contains the scripts that make it go.
//

// See if we can make leaflet-sidebar-v2 module happy.
// Even even better, make the navbar a leaflet control.

// Get and parse the config file
// import JSON5 from "./libs/json5/json5.min.js";
import config from 'config';
import navbar from 'navbar';
import {Map, TileLayer, LayerGroup, Control} from 'leaflet';
import SVGMarker from 'SVGMarkers';
import LayersTree from 'LayersTree';
import { OpenLocationCode, PlusCode } from 'OpenlocationCode';

let map, layersControl;

async function Ajax(method, url) {
    // ROADMAP:  Add a timeout (AbortController)
    let response, j;
    try {
        const headers = {}
        response = await fetch(url);
        for (let [key, value] of response.headers) {
            headers[key] = value;
        }
        j = await response.text();
        const ContentType = response.headers.get('Content-Type');
        if (ContentType == 'application/json') {
            j = JSON5.parse(j);
        } 
        return j;
    } catch(e) {
        console.error(`fetch ${url}: ${e.name}:${e.message}`);
        return null;
    }
}

// Load data from JSON[5] files specified in the config file
async function Load_Data(key, s) {
    // FIXME:  Figure out how to convert Open Location codes
    try {
        let o = await Ajax('GET', s);

        let markerArray = [];
        const defaultMarker = o.defaultMarker || {};

        for (const item in o) {
            // This isn't a marker, so move on
            if (item == "defaultMarker") { continue; };
            if (item == "Category") { continue; };
            let d = o[item];

            // the "marker" option
            d.marker = d.marker || {};
            let markerOpts = { ...defaultMarker, ...d.marker };
            // See if the provided location is a PlusCode
            d.Location = await PlusCode.decode(d.Location);
            let m = new SVGMarker(d.Location, markerOpts);

            // Bind a popup
            const a = document.createElement('a');
            a.setAttribute('target', '_new');
            if (d.Link) { a.setAttribute('href', d.Link); }
            a.textContent = item;
            m.bindPopup(a);

            // Once we have the marker built, add it to our array
            markerArray.push(m);
        }
        const LGroup = new LayerGroup(markerArray);
        if (o.Category) {
            console.log(`Adding ${key} to ${o.Category}`);
            LGroup._LTgroup = o.Category;
        }
        return LGroup;
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

    // Create a layerGroup object (lgo) that has key:value pairs 
    // containing the name of the layer and the layer itself
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
                layer._LTgroup = "Bus Routes";
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
        layersControl = new LayersTree(null, lgo, opts);
        layersControl.addTo(map);
    }
    return map;
}

map = await Load_Map();

async function load_weather() {
    // find a way to not load on mobile
    if (!!config.Weather && !(navigator.maxTouchPoints > 0)) {
        let OM_url = "./js/Leaflet.OpenMeteo.mjs";
        let mod = await import(OM_url);
        new mod.OpenMeteo({autoTitle: true}).addTo(map);
    }
}

// Hard to set this up in navbar.js because we need access to 
// the map and layercontrol, and module isolation make that 
// problematic (not impossible, just more difficult).
const activate_search = async function() {
    console.log("Search button clicked");
    const el = document.querySelector('#searchbutton');
    if (!el) { return; }
    el.addEventListener('click', async function(e) {
        e.preventDefault();
        if (!e.target) { return; }
        const el = document.querySelector('#searchbox');
        const amenity = el.value;
        console.log(`searching for ${amenity}`);
        const customMarker = function(point, latlng) {
            const props = point.properties || {};
            let ptype = props.type || "unknown";
            let guide = {
                restaurant: {color:'black', glyph:'bx-fork-spoon'},
                bar: {color:'black',glyph:'bx-beer'},
                cafe: {color:'black', glyph:'bx-cup'},
                pub: {color: 'black',glyph:'bx-beer',glyphColor:'yellow'},
                hospital: {color:'red', glyph:'bx-cursor-cell'},
                police: {color: 'white', glyph:'bx-man',glyphColor:'black'},
                dentist: {color:'green', glyph:'bx-tooth'},
                cinema: {glyph:'bx-video'},
                theatre: {glyph:'bx-group'},
                museum: {glyph:'bx-bank'},
                bakery: {color:'black',glyph:'bx-cupcake'},
            };
            let options = guide[ptype] || {};
            // let options = markerKey[type] || {}
            const marker = new SVGMarker(latlng, options);
            const a = document.createElement('a');
            a.setAttribute('target', '_new');
            if (props.name == "") { return null; }
            const list = [props.name || ''];
            // FIXME:  Need to get better at this.
            if (props.extratags) {
                let l = props.extratags.website;
                if (l) {
                    a.href = l;
                }
                //const j = JSON.stringify(props.extratags, null, 2);
                //for (l of j.split('\n')) {
                //    list.push(l);
                //}
            }
            for (let l of list) {
                let p = document.createElement('p');
                p.textContent = l;
                a.appendChild(p);
            }
            marker.bindPopup(a);
            return marker;
        }
        const area = map.getBounds();
        const sw = area.getSouthWest();
        const ne = area.getNorthEast();
        const viewbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`
        const query = encodeURIComponent(amenity);
        let url = 'https://nominatim.osm.org/search?format=geojson';
        url = url + `&bounded=1&viewbox=${viewbox}&amenity=${query}`;
        url = url + '&extratags=1&limit=40';
        let layer = null;
        try {
            let r = await fetch(url);
            if (r.ok) {
                const j = await r.json();
                let geojsonOptions = { pointToLayer: customMarker, }
                layer = new L.GeoJSON(j, geojsonOptions); 
            } else {
                console.log(await j.text());
            }
        } catch (e) { console.log(`${e.name}: ${e.message}`) }
        if (layer && Object.keys(layer._layers).length) {
            console.log(`layer[${amenity}] = `, layer);
            layer._LTgroup = 'Searches';
            // Is there a way to avoid duplicates?  Maybe
            // replace the layer?
            layersControl.addOverlay(layer, amenity);
        }
    });
}

load_weather();
await activate_search();

// For this to work, need to import at least one glyphicon css file
let options = {
    glyph: 'bx-bed-alt',
    color: 'darkblue',
}
let marker = new SVGMarker([-25.287687,-57.633063], options).bindPopup("Hostel Patagonia");
marker.addTo(map);



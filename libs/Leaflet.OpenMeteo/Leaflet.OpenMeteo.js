//
//    Leaflet.Open-Meteo.js
//   
//    Make sure this is 2.0 ready.  Means we need to esm it
//    How do you use node to make a dist folder and stuff?

//    For the icons, is it better to inline them?  DataURI?  defs?
//    Learn more about SVG's.
//    we have options: boxicons, bootstrap icons, etc.  Extract the 
//    svg data, make SURE we include license info/link (perhaps in the
//    README.md)
//

L.Control.OpenMeteo = L.Control.extend({
    // I've always wondered why we load CSS in our HTML when
    // it's just as easy to simply include it in your javascript.
    // 
    writeCSS: function() {
        const our_CSS = `
.leaflet-control-openmeteo {
  color:#eee;
  background:#555;
  padding:1em;
  opacity:0.7;
  width:200px;
}

.leaflet-control-openmeteo .weatherIcon {
  float:left;
  border:1px solid #fff;
  font-size:2.5em;
  width:50px;
  height:50px;
  text-align:center;
  margin-right:10px;
  stroke: "white";
}

.leaflet-control-openmeteo .weatherIcon img {
  float:left;
  max-width: 100% !important;
  height: 50px;
  width: 50px;
  stroke: white;
  stroke-width: 2px;
}

.leaflet-control-openmeteo h4 {
  font-size: 1.5em;
  text-align: center;
}

.om {
  max-width: 100% !important;
  height: 50px;
  width: 50px;
  stroke: red;
}

.om-0 {
  stroke: white;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath fill='%23444' d='M20.406 11.656q1.813 1.781 1.813 4.375 0 2.625-1.781 4.406-1.813 1.781-4.406 1.781t-4.375-1.781q-1.813-1.781-1.813-4.406 0-2.594 1.781-4.375 1.813-1.813 4.406-1.813t4.375 1.813zM16 11.188q-2.031 0-3.438 1.375-1.406 1.406-1.406 3.469 0 2.031 1.406 3.438 1.406 1.438 3.438 1.438 2.094 0 3.469-1.406 1.406-1.438 1.406-3.469 0-2.063-1.375-3.438-1.406-1.406-3.5-1.406zM4.5 16.469q-.188-.156-.188-.438 0-.25.188-.438t.438-.188h2.875q.25 0 .406.188.188.188.188.438t-.156.438-.406.188H4.939q-.25 0-.438-.188zM24 8.875l-1.688 1.719q-.219.188-.469.188-.281 0-.469-.219-.156-.156-.156-.406 0-.281.156-.438l1.719-1.75q.188-.156.438-.156.281 0 .469.156.156.188.156.438 0 .281-.156.469zM7.844 8.438q0-.281.188-.469.156-.156.406-.156.281 0 .469.156l1.719 1.75q.156.156.156.406 0 .281-.156.438-.156.219-.438.219t-.469-.188L8.031 8.875q-.188-.188-.188-.438zM15.531 4.5q.188-.219.438-.219.281 0 .469.188.188.219.188.469v2.844q0 .25-.188.438T16 8.408t-.438-.156q-.188-.188-.188-.438V4.939q0-.25.156-.438zm0 19.344q.188-.188.438-.188.281 0 .469.188.188.219.188.469v2.844q0 .25-.188.438t-.438.188-.438-.156q-.188-.188-.188-.438v-2.875q0-.25.156-.469zm8.25-7.344q-.188-.188-.188-.469 0-.25.188-.438t.438-.188h2.875q.25 0 .406.188.188.188.188.438t-.156.438-.406.188H24.22q-.25 0-.438-.156zm.375 7.094q0 .281-.156.5-.188.156-.438.156-.281 0-.469-.156l-1.719-1.75q-.156-.156-.156-.406 0-.281.156-.438.188-.219.438-.219.281 0 .5.188L24 23.188q.156.156.156.406zm-16.125-.406 1.688-1.719q.188-.188.469-.188t.438.219q.156.156.156.406 0 .281-.156.438l-1.719 1.75q-.188.156-.438.156-.281 0-.438-.156-.188-.219-.188-.469 0-.281.188-.438z'/%3E%3C/svg%3E");
}
/* cloudy */
.om-1, .om-2, .om-3 {
  stroke: white;
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M19.62%2011.11C19.19%207.12%2015.94%204%2012%204%208.95%204%206.31%205.87%205.13%208.82%202.77%209.53%201%2011.85%201%2014.33%201%2017.45%203.44%2020%206.44%2020h12.22c2.39%200%204.33-2.02%204.33-4.5%200-2.14-1.45-3.94-3.38-4.39ZM18.67%2018H6.44C4.54%2018%203%2016.35%203%2014.33c0-1.72%201.38-3.37%203.07-3.68l.58-.11.19-.56C7.64%207.53%209.62%206%2012%206c3.12%200%205.67%202.69%205.67%206v1h1c1.29%200%202.33%201.12%202.33%202.5S19.95%2018%2018.67%2018%22%2F%3E%3C%2Fsvg%3E);
}
`;
        // According to caniuse.com this should work on 99.32% of the world.  
        try {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(our_CSS);
            document.adoptedStyleSheets.push(sheet);
        } catch (e) {
            // The rest, well... 
            console.warn("You should replace your browser", e.message);
        }
    },

    control_template: function() {
        // This would be easier if I let myself use .innerHTML, but....
        const cdiv = L.DomUtil.create('div', 'leaflet-control-openmeteo');
        const titlediv = L.DomUtil.create('h4', '', cdiv);
        titlediv.textContent = this.options.title;
        const idiv = L.DomUtil.create('div', '', cdiv);
        const img = L.DomUtil.create('img', 'weatherIcon', idiv);
        this._img = img;
        const tdiv = L.DomUtil.create('div', '', cdiv);
        let s1 = L.DomUtil.create('span', '', tdiv);
        s1.textContent = "T: ";
        let s2 = L.DomUtil.create('span', '', tdiv);
        s2.textContent = "{temp}";
        this._tspan = s2;
        const hdiv = L.DomUtil.create('div', '', cdiv);
        s1 = L.DomUtil.create('span', '', hdiv);
        s1.textContent = "H: ";
        s2 = L.DomUtil.create('span', '', hdiv);
        s2.textContent = "{RH}";
        this._hspan = s2;
        const wdiv = L.DomUtil.create('div', '', cdiv);
        s1 = L.DomUtil.create('span', '', wdiv);
        s1.textContent = "{wind}";
        this._wspan = s1;

        return cdiv;
    },

    options: {
        position: "bottomleft",
        title: "Open-Meteo",
    },

    tweakConfig: function() {
        if (this.options.center) {
            let p = this.options.center;
            this.options.center = new L.latLng(p[0], [1]);
        }
        if (this.options.wind_directions) {
            if (this.options.wind_directions.toLowerCase() == "default") {
                this.options.wdirs = [ 
                    "N", "NE", "E", "SE", "S", "SW", "W", "NW" 
                ];
            } else {
                // FIXME: ??If "wdirs", convert to Array??
                console.log("Need to parse wind_directions");
            }
        }
    },

    onAdd: function(map) {
        this.tweakConfig();
        this.writeCSS();
        this._div = this.control_template();
        map.on("moveend", this.refresh, this);  
        // Wall/MagicMirror displays might never get panned, so
        window.setInterval(this.refresh.bind(this), 3600000);
        this.refresh(); // Initialize the data
        return this._div;
    },

    refresh: async function(e) {
        function addUnits(weather_item) {
            let s = current[weather_item] + units[weather_item];
            return s;
        }
        let center = this.options.center || this._map.getCenter();
        let url = "https://api.open-meteo.com/v1/forecast?latitude=";
        url = url + center.lat + "&longitude=" + center.lng;
        url = url + "&current=temperature_2m,relative_humidity_2m,"
        url = url + "wind_speed_10m,wind_direction_10m,precipitation,"
        url = url + "rain,showers,weather_code,cloud_cover,uv_index";
        // FIXME: Figure out how to debounce this.  15 seconds?
        let reply;
        try {
            const response = await fetch(url);
            reply = await(response.json());
        } catch (e) {
            console.error(`Leaflet.OpenMeteo: ${e.message}`);
            return;
        }
        const current = reply.current;
        const units = reply.current_units;
        this._tspan.textContent = addUnits("temperature_2m");
        this._hspan.textContent = addUnits("relative_humidity_2m");;
        let wdir;
        if (this.options.wdirs) {
            wdir = this.mapWindDirection(current.wind_direction_10m);
        } else {
            wdir = current.wind_direction_10m;
        }
        let wind = wdir + "@" + addUnits("wind_speed_10m");
        this._wspan.textContent = wind;
        const imgClass = "om-" + current.weather_code;
        const cl = this._img.classList;
        for (c in cl) {
            if (c.startsWith("om-")) {
                this._img.classList.remove(c);
            }
        }
        this._img.classList.add('om');
        this._img.classList.add(imgClass);
        console.log(this._img);
    },

    mapWindDirection: function(degrees) {
        // Map wind direction to things like "E" and "SW"
        const tlen = this.options.wdirs.length;
        const divisor = 360 / (tlen);
        degrees = (degrees + (divisor/2)) % 360
        let d = Math.round(degrees/divisor) % (tlen);
        return this.options.wdirs[d];
    }
});

// For 2.0, get rid of the factory method
L.control.weather = function(options) {
    return new L.Control.Weather(options);
};

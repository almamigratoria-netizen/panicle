//
//    Leaflet.Open-Meteo.mjs
//      Leaflet v2 Control to display weather on the map
//      Uses Open-Meteo API (free for non-commerical use)
//

import {Control, LatLng, Util} from 'leaflet';

export class OpenMeteo extends Control {

    static {
        // Not sure what should go here  :-(
    }

    initialize(options) {
        const default_options = {
            position: "bottomleft",
            title: "Open-Meteo",
        };
        this.name = OpenMeteo;
        Util.setOptions(this, default_options);
        Util.setOptions(this, options);
        let foo = "bar";
    }

    _control_template() {
        // Easier to define the function ourselves than to import from leaflet
        // It's small, so no need to import DOMUtil
        function create(tag, className='', mama=undefined) {
            const el = document.createElement(tag);
            el.className = className;
            mama?.appendChild(el);
            return el;
        };

        // This would be easier if I let myself use .innerHTML
        // So (needs test) should work even with retrictive CSP
        const cdiv = create('div', 'leaflet-control-openmeteo');
        const titlediv = create('h4', '', cdiv);
        this._titlediv = titlediv;
        titlediv.textContent = this.options.title;
        const idiv = create('div', '', cdiv);
        const img = create('img', 'weatherIcon', idiv);
        this._img = img;
        const tdiv = create('div', '', cdiv);
        let s1 = create('span', '', tdiv);
        s1.textContent = "T: ";
        let s2 = create('span', '', tdiv);
        s2.textContent = "{temp}";
        this._tspan = s2;
        const hdiv = create('div', '', cdiv);
        s1 = create('span', '', hdiv);
        s1.textContent = "H: ";
        s2 = create('span', '', hdiv);
        s2.textContent = "{RH}";
        this._hspan = s2;
        const wdiv = create('div', '', cdiv);
        s1 = create('span', '', wdiv);
        s1.textContent = "{wind}";
        this._wspan = s1;

        return cdiv;
    };

    _tweakConfig() {
        if (this.options.center) {
            let p = this.options.center;
            this.options.center = new L.LatLng(p[0], [1]);
        }
        if (this.options.wind_directions) {
            if (this.options.wind_directions.toLowerCase() == "default") {
                this.options.wdirs = [ 
                    "N", "NE", "E", "SE", "S", "SW", "W", "NW" 
                ];
            } else {
                this.options.wdirs = this.option.wind_drections; 
            }
        }
    };

    _debounce(func, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    onAdd(map) {
        this._tweakConfig();
        this._div = this._control_template();
        // Wall/MagicMirror displays might never get panned, so...
        const rfunc = this.refresh.bind(this);
        const debounced_update = this._debounce(rfunc, 750);
        window.setInterval(debounced_update, 3600000);
        map.on("moveend", debounced_update, this);  
        debounced_update(); // Initialize the data
        return this._div;
    };

    async refresh_autoTitle(titlediv) {
        const NOSM='https://nominatim.openstreetmap.org/reverse'
        const center = this._map.getCenter();
        let url = `${NOSM}?lat=${center.lat}&lon=${center.lng}`;
        url = url + '&zoom=10&format=jsonv2';

        try {
            const r = await fetch(url);
            const j = await r.json();
            if (j.error) {
                titlediv.textContent = "Here be dragons";
                return;
            }
            let c = j.address.city || j.address.municipality;
            c = c || j.address.state || j.address.country;
            c = c || 'Open-Meteo';
            titlediv.textContent = c;
        } catch (e) {
            console.warn(`${e.name}: ${e.message}(${url})`);
        }
    }

    async refresh(ev) {
        function addUnits(weather_item) {
            return current[weather_item] + units[weather_item];
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
            const r = await fetch(url);
            reply = await(r.json());
            if (!r.ok) {
                let e = new Error(`fetch(${r.statusText})`);
                throw(e);
            }
        } catch (e) {
            console.error(`Leaflet.OpenMeteo: ${e.name} ${e.message}`);
            return;
        }
        const current = reply.current;
        const units = reply.current_units;
        this._tspan.textContent = addUnits("temperature_2m");
        this._hspan.textContent = addUnits("relative_humidity_2m");;
        let wdir = current.wind_direction_10m;
        if (this.options.wdirs) {
            wdir = this.mapWindDirection(current.wind_direction_10m);
        }
        let wind = wdir + "@" + addUnits("wind_speed_10m");
        this._wspan.textContent = wind;
        const imgClass = "om-" + current.weather_code;
        this._img.classList = `weatherIcon ${imgClass}`;

        // function's getting long... maybe refactor this into
        // another function
        if (this.options.autoTitle) {
            this.refresh_autoTitle(this._titlediv);
        }
    };

    mapWindDirection(degrees) {
        // Map wind direction to things like "E" and "SW"
        // or "from the slaughterhouse district", but that's too
        // long to fit in the control...
        const tlen = this.options.wdirs.length;
        const divisor = 360 / (tlen);
        degrees = (degrees + (divisor/2)) % 360
        let d = Math.round(degrees/divisor) % (tlen);
        return this.options.wdirs[d];
    }
};

export default OpenMeteo;

// Not sure if minimizers will minify CSS embedded in js file
// Should check on that....
(function() {
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
  width:50px;
  height:50px;
  margin-right:10px;
}
.leaflet-control-openmeteo.weatherIcon img {
  float:left;
  max-width: 100% !important;
  height: 100%;
  width: 100%;
  object-fit: fill;
  stroke-width: 2px;
}
.leaflet-control-openmeteo h4 {
  font-size: 1.5em;
  text-align: center;
  margin-block-start: 12px;
  margin-block-end: 12px;
}

/* If the dataURL was smaller as base64, then base64'd it.  Some are, some
 * are not.  Further reduction in size is probably possible.  CSS3 allows
 * path:, but I haven't figured that one out, so for now....
 */

/* sunny */
.om-0 {
    background-image: url('data:image/svg+xml,%3C%3Fxml version%3D"1.0" %3F%3E%3Csvg viewBox%3D"0 0 24 24" xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg"%3E%3Cpath%20d%3D%22M12%2017.01c2.76%200%205.01-2.25%205.01-5.01S14.76%206.99%2012%206.99%206.99%209.24%206.99%2012s2.25%205.01%205.01%205.01M12%209c1.66%200%203.01%201.35%203.01%203.01s-1.35%203.01-3.01%203.01-3.01-1.35-3.01-3.01S10.34%209%2012%209m1%2010h-2v3h2zm0-17h-2v3h2zM2%2011h3v2H2zm17%200h3v2h-3zM4.22%2018.36l.71.71.71.71%201.06-1.06%201.06-1.06-.71-.71-.71-.71-1.06%201.06zM19.78%205.64l-.71-.71-.71-.71-1.06%201.06-1.06%201.06.71.71.71.71%201.06-1.06zm-12.02.7L6.7%205.28%205.64%204.22l-.71.71-.71.71L5.28%206.7l1.06%201.06.71-.71zm8.48%2011.32%201.06%201.06%201.06%201.06.71-.71.71-.71-1.06-1.06-1.06-1.06-.71.71z%22%2F%3E%3C%2Fsvg%3E');
}
/* cloudy */
.om-1, .om-2, .om-3 {
  background-image: url('data:image/svg+xml,%3C%3Fxml version%3D"1.0" %3F%3E%3Csvg viewBox%3D"0 0 24 24" xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg"%3E%3Cpath stroke%3D"white" d%3D"M19.62 11.11C19.19 7.12 15.94 4 12 4 8.95 4 6.31 5.87 5.13 8.82 2.77 9.53 1 11.85 1 14.33 1 17.45 3.44 20 6.44 20h12.22c2.39 0 4.33-2.02 4.33-4.5 0-2.14-1.45-3.94-3.38-4.39ZM18.67 18H6.44C4.54 18 3 16.35 3 14.33c0-1.72 1.38-3.37 3.07-3.68l.58-.11.19-.56C7.64 7.53 9.62 6 12 6c3.12 0 5.67 2.69 5.67 6v1h1c1.29 0 2.33 1.12 2.33 2.5S19.95 18 18.67 18"%2F%3E%3C%2Fsvg%3E');
}
/* fog */
.om-45, .om-48 {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9ImN1cnJlbnRDb2xvciIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNMyAxMy41YS41LjUgMCAwIDEgLjUtLjVoOWEuNS41IDAgMCAxIDAgMWgtOWEuNS41IDAgMCAxLS41LS41bTAgMmEuNS41IDAgMCAxIC41LS41aDlhLjUuNSAwIDAgMSAwIDFoLTlhLjUuNSAwIDAgMS0uNS0uNW0xMC40MDUtOS40NzNhNS4wMDEgNS4wMDEgMCAwIDAtOS40OTktMS4wMDRBMy41IDMuNSAwIDEgMCAzLjUgMTJIMTNhMyAzIDAgMCAwIC40MDUtNS45NzNNOC41IDNhNCA0IDAgMCAxIDMuOTc2IDMuNTU1LjUuNSAwIDAgMCAuNS40NDVIMTNhMiAyIDAgMCAxIDAgNEgzLjVhMi41IDIuNSAwIDEgMSAuNjA1LTQuOTI2LjUuNSAwIDAgMCAuNTk2LS4zMjlBNCA0IDAgMCAxIDguNSAzIi8+PC9zdmc+Cg==');
}
/* drizzle (light, moderate, and dense) */
/* 56, 57 are freezing drizzle */
.om-51, .om-53, .om-55, .om-56, .om-57 {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9ImN1cnJlbnRDb2xvciIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNNC4xNTggMTIuMDI1YS41LjUgMCAwIDEgLjMxNi42MzNsLS41IDEuNWEuNS41IDAgMCAxLS45NDgtLjMxNmwuNS0xLjVhLjUuNSAwIDAgMSAuNjMyLS4zMTdtMyAwYS41LjUgMCAwIDEgLjMxNi42MzNsLTEgM2EuNS41IDAgMCAxLS45NDgtLjMxNmwxLTNhLjUuNSAwIDAgMSAuNjMyLS4zMTdtMyAwYS41LjUgMCAwIDEgLjMxNi42MzNsLS41IDEuNWEuNS41IDAgMCAxLS45NDgtLjMxNmwuNS0xLjVhLjUuNSAwIDAgMSAuNjMyLS4zMTdtMyAwYS41LjUgMCAwIDEgLjMxNi42MzNsLTEgM2EuNS41IDAgMSAxLS45NDgtLjMxNmwxLTNhLjUuNSAwIDAgMSAuNjMyLS4zMTdtLjI0Ny02Ljk5OGE1LjAwMSA1LjAwMSAwIDAgMC05LjQ5OS0xLjAwNEEzLjUgMy41IDAgMSAwIDMuNSAxMUgxM2EzIDMgMCAwIDAgLjQwNS01Ljk3M004LjUgMmE0IDQgMCAwIDEgMy45NzYgMy41NTUuNS41IDAgMCAwIC41LjQ0NUgxM2EyIDIgMCAwIDEgMCA0SDMuNWEyLjUgMi41IDAgMSAxIC42MDUtNC45MjYuNS41IDAgMCAwIC41OTYtLjMyOUE0IDQgMCAwIDEgOC41IDIiLz48L3N2Zz4=');
}
/* Steady Rain (Slight, moderate, heavy) */
.om-61, .om-63, .om-65 {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9ImN1cnJlbnRDb2xvciIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNNC4xNTggMTIuMDI1YS41LjUgMCAwIDEgLjMxNi42MzNsLS41IDEuNWEuNS41IDAgMCAxLS45NDgtLjMxNmwuNS0xLjVhLjUuNSAwIDAgMSAuNjMyLS4zMTdtMyAwYS41LjUgMCAwIDEgLjMxNi42MzNsLTEgM2EuNS41IDAgMCAxLS45NDgtLjMxNmwxLTNhLjUuNSAwIDAgMSAuNjMyLS4zMTdtMyAwYS41LjUgMCAwIDEgLjMxNi42MzNsLS41IDEuNWEuNS41IDAgMCAxLS45NDgtLjMxNmwuNS0xLjVhLjUuNSAwIDAgMSAuNjMyLS4zMTdtMyAwYS41LjUgMCAwIDEgLjMxNi42MzNsLTEgM2EuNS41IDAgMSAxLS45NDgtLjMxNmwxLTNhLjUuNSAwIDAgMSAuNjMyLS4zMTdtLjI0Ny02Ljk5OGE1LjAwMSA1LjAwMSAwIDAgMC05LjQ5OS0xLjAwNEEzLjUgMy41IDAgMSAwIDMuNSAxMUgxM2EzIDMgMCAwIDAgLjQwNS01Ljk3M004LjUgMmE0IDQgMCAwIDEgMy45NzYgMy41NTUuNS41IDAgMCAwIC41LjQ0NUgxM2EyIDIgMCAwIDEgMCA0SDMuNWEyLjUgMi41IDAgMSAxIC42MDUtNC45MjYuNS41IDAgMCAwIC41OTYtLjMyOUE0IDQgMCAwIDEgOC41IDIiLz48L3N2Zz4K');
}
/* Freezing Rain */
.om-66, .om-67 {
  background-image: url('data:image/svg+xml,%3Csvg xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" viewBox%3D"0 0 16 16"%3E%3Cpath d%3D"M13.405 4.027a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 10H13a3 3 0 0 0 .405-5.973M8.5 1a4 4 0 0 1 3.976 3.555.5.5 0 0 0 .5.445H13a2 2 0 0 1 0 4H3.5a2.5 2.5 0 1 1 .605-4.926.5.5 0 0 0 .596-.329A4 4 0 0 1 8.5 1M2.375 13.5a.25.25 0 0 1 .25.25v.57l.501-.287a.25.25 0 0 1 .248.434l-.495.283.495.283a.25.25 0 0 1-.248.434l-.501-.286v.569a.25.25 0 1 1-.5 0v-.57l-.501.287a.25.25 0 0 1-.248-.434l.495-.283-.495-.283a.25.25 0 0 1 .248-.434l.501.286v-.569a.25.25 0 0 1 .25-.25m1.849-2.447a.5.5 0 0 1 .223.67l-.5 1a.5.5 0 1 1-.894-.447l.5-1a.5.5 0 0 1 .67-.223zM6.375 13.5a.25.25 0 0 1 .25.25v.57l.501-.287a.25.25 0 0 1 .248.434l-.495.283.495.283a.25.25 0 0 1-.248.434l-.501-.286v.569a.25.25 0 1 1-.5 0v-.57l-.501.287a.25.25 0 0 1-.248-.434l.495-.283-.495-.283a.25.25 0 0 1 .248-.434l.501.286v-.569a.25.25 0 0 1 .25-.25m1.849-2.447a.5.5 0 0 1 .223.67l-.5 1a.5.5 0 1 1-.894-.447l.5-1a.5.5 0 0 1 .67-.223zm2.151 2.447a.25.25 0 0 1 .25.25v.57l.501-.287a.25.25 0 0 1 .248.434l-.495.283.495.283a.25.25 0 0 1-.248.434l-.501-.286v.569a.25.25 0 1 1-.5 0v-.57l-.501.287a.25.25 0 0 1-.248-.434l.495-.283-.495-.283a.25.25 0 0 1 .248-.434l.501.286v-.569a.25.25 0 0 1 .25-.25m1.849-2.447a.5.5 0 0 1 .223.67l-.5 1a.5.5 0 1 1-.894-.447l.5-1a.5.5 0 0 1 .67-.223z"%2F%3E%3C%2Fsvg%3E');
}
/* Snowfall (slight, moderate, heavy) */
.om-71, .om-73, .om-75, .om-77, .om-85, .om-86 {
  background-image: url('data:image/svg+xml,%3Csvg xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" fill%3D"currentColor" viewBox%3D"0 0 16 16"%3E%3Cpath d%3D"M8 16a.5.5 0 0 1-.5-.5v-1.293l-.646.647a.5.5 0 0 1-.707-.708L7.5 12.793V8.866l-3.4 1.963-.496 1.85a.5.5 0 1 1-.966-.26l.237-.882-1.12.646a.5.5 0 0 1-.5-.866l1.12-.646-.884-.237a.5.5 0 1 1 .26-.966l1.848.495L7 8 3.6 6.037l-1.85.495a.5.5 0 0 1-.258-.966l.883-.237-1.12-.646a.5.5 0 1 1 .5-.866l1.12.646-.237-.883a.5.5 0 1 1 .966-.258l.495 1.849L7.5 7.134V3.207L6.147 1.854a.5.5 0 1 1 .707-.708l.646.647V.5a.5.5 0 1 1 1 0v1.293l.647-.647a.5.5 0 1 1 .707.708L8.5 3.207v3.927l3.4-1.963.496-1.85a.5.5 0 1 1 .966.26l-.236.882 1.12-.646a.5.5 0 0 1 .5.866l-1.12.646.883.237a.5.5 0 1 1-.26.966l-1.848-.495L9 8l3.4 1.963 1.849-.495a.5.5 0 0 1 .259.966l-.883.237 1.12.646a.5.5 0 0 1-.5.866l-1.12-.646.236.883a.5.5 0 1 1-.966.258l-.495-1.849-3.4-1.963v3.927l1.353 1.353a.5.5 0 0 1-.707.708l-.647-.647V15.5a.5.5 0 0 1-.5.5z"%2F%3E%3C%2Fsvg%3E');
}
/* Rain showers (Slight, moderate, violent) */
.om-80, .om-81, .om-82 {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHBhdGggZD0iTTQuMTc2IDExLjAzMmEuNS41IDAgMCAxIC4yOTIuNjQzbC0xLjUgNGEuNS41IDAgMSAxLS45MzYtLjM1bDEuNS00YS41LjUgMCAwIDEgLjY0NC0uMjkzbTMgMGEuNS41IDAgMCAxIC4yOTIuNjQzbC0xLjUgNGEuNS41IDAgMSAxLS45MzYtLjM1bDEuNS00YS41LjUgMCAwIDEgLjY0NC0uMjkzbTMgMGEuNS41IDAgMCAxIC4yOTIuNjQzbC0xLjUgNGEuNS41IDAgMSAxLS45MzYtLjM1bDEuNS00YS41LjUgMCAwIDEgLjY0NC0uMjkzbTMgMGEuNS41IDAgMCAxIC4yOTIuNjQzbC0xLjUgNGEuNS41IDAgMCAxLS45MzYtLjM1bDEuNS00YS41LjUgMCAwIDEgLjY0NC0uMjkzbS4yMjktNy4wMDVhNS4wMDEgNS4wMDEgMCAwIDAtOS40OTktMS4wMDRBMy41IDMuNSAwIDEgMCAzLjUgMTBIMTNhMyAzIDAgMCAwIC40MDUtNS45NzNNOC41IDFhNCA0IDAgMCAxIDMuOTc2IDMuNTU1LjUuNSAwIDAgMCAuNS40NDVIMTNhMiAyIDAgMCAxIDAgNEgzLjVhMi41IDIuNSAwIDEgMSAuNjA1LTQuOTI2LjUuNSAwIDAgMCAuNTk2LS4zMjlBNCA0IDAgMCAxIDguNSAxIi8+PC9zdmc+Cg==');
}
/* Thunderstorm */
.om-95, .om-96, .om-99 {
  background-image: url('data:image/svg+xml,%3Csvg xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" viewBox%3D"0 0 16 16"%3E%3Cpath d%3D"M2.658 11.026a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m9.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m-7.5 1.5a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m9.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m-.753-8.499a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 10H13a3 3 0 0 0 .405-5.973M8.5 1a4 4 0 0 1 3.976 3.555.5.5 0 0 0 .5.445H13a2 2 0 0 1 0 4H3.5a2.5 2.5 0 1 1 .605-4.926.5.5 0 0 0 .596-.329A4 4 0 0 1 8.5 1M7.053 11.276A.5.5 0 0 1 7.5 11h1a.5.5 0 0 1 .474.658l-.28.842H9.5a.5.5 0 0 1 .39.812l-2 2.5a.5.5 0 0 1-.875-.433L7.36 14H6.5a.5.5 0 0 1-.447-.724z"%2F%3E%3C%2Fsvg%3E');
}
`;
try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(our_CSS);
    document.adoptedStyleSheets.push(sheet);
} catch (e) {
    // According to caniuse, this should have worked on any browser that
    // Leaflet v2 targets (evergreen).  The rest, well... 
    console.warn("You should replace your broken browser", e.message);
}
})();

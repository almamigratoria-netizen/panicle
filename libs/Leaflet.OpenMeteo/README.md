# Leaflet.OpenMeteo
A [leaflet](https://leafletjs.com) plugin to display weather using
the [Open-Meteo API](https://www.open-meteo.org).  It was inspired by
the [ Leaflet.Weather ](https://github.com/oskosk/Leaflet.Weather) plugin.  
Primary differences are that Leaflet.OpenMeteo has no dependancies 
(no JQuery), doesn't require an API key (for most use cases), and 
(hopefully) will be Leaflet version 2 compatible. 

[<img src="screenshot.png">](https://oskosk.github.io/Leaflet.Weather)

## Example
``` javascript
    // Create a map in the "map" div, set the view to a given place and zoom
     map = L.map('map').setView([-51.5, 0.1], 13);

    // add an OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    }).addTo(map);

    // add the weather control
    new L.Control.Weather({ }).addTo(map);

    // You can add multiple instances.
    // Add a control for London
    new L.Control.Weather({
        title: "London",
        center: [51.5, -0.1],
    }).addTo(map);
```

## Installation
Just include the JS in your HTML.  The CSS is built in.
```html
    <script src="Leaflet.OpenMeteo.min.js"></script>
```

### Options
* `position` - Leaflet [position option](http://leafletjs.com/reference.html#control-options) for Controls.
* `title` - Title for control.  Defaults to "OpenMeteo".  Useful when creating multiple instances.
* `location` - Not to be confused with `position`, this is the lat/lng from where you want the weather.  Defaults to the center of the map.  Useful when creating multiple instances.
* ROADMAP -- allow you to translate wind directions to things like "SE", etc

## Useful links
- [Code table 4677](https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM)
- [GOES Satellite Imagery](https://www.star.nesdis.noaa.gov/GOES/)

## License
The Leaflet.OpenMeteo plugin is released under the [MIT License](https://opensource.org/license/mit)<br/>
The weather images were taken from [XXX](https://github.com/xxx/yyy) and are licenced under the terms of [XXX](https://opensource.org/license/xxx)<br/>
The [Open-Meteo API](https://open-meteo.com/en/pricing) has a tiered license, which you should check out if you plan on deploying this plugin in a commerical setting.

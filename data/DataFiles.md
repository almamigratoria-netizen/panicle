# Panicle data files
Data files for panicle are [JSON5](https://www.json5.org) format.  Since most 
web servers don't seem to be configured to provide the correct "content-type", 
we use the .json extension.

```json5
// OK, Pizza.  Pizza is good.
// Options are covered in the file "DataFiles.md"
{
    // Category feeds into the map layer control.  Map layers will appear
    // on the layer control under the Category name.
    Category: "Food",
    // defaultMarker is optional
    defaultMarker: {
        glyph: name of glyph to put in the Marker,
        markerColor: note that there are limited options,
        shape:  (optional)  defaults to regular Marker
        prefix: (optional)  the prefix for the icon font
    }
    Zampano: {
        // the options in Marker get merged into defaultMarker
        Marker: {
            glyph: 'bx-pizza-alt',
            markerColor: 'red',
            shape: 'square',
        },
        Location: [-25.286187,-57.632438],
        Link: "https://www.instagram.com/zampanopizzeria/?hl=en"
    },
    "Pizzaria Don Maria": {
        // if neither DefaultMarker nor Marker is specified, you'll
        // get the default Leaflet marker.
        Location: [-25.290438,-57.634812],
        Link: "https://www.instagram.com/donmariopy/"
    },
} 
// vim: syntax=json5
```
# geoJSON
geoJSON can also be loaded.  I envisioned this as being useful for bus
routes, but use your imagination.  If you don't have geoJSON of bus routes,
you can try the [BusRoutes](https://github.com/almamigratoria-netizen/BusRoutes) project .
## Options

## Marker Options
Full documentation can be found in the documentation for [Leaflet.SVGMarkers](https://github.com/almamigratoria-netizen/Leaflet-SVGMarkers), but these are the ones you probably need.

| Property        | Description                                 | Default Value | Possible  values                                     |
| --------------- | ---------------------------------- | ------------- | ---------------------------------------- |
| glyph           | Name of the icon **with** prefix   | `''`          | `any icon name your icon library supports` |
| glyphColor      | Color of the icon                  | `'white'`     | `any color supported by CSS3` |
| color           | Color of the marker                | `'blue'`      | `any color supported by CSS3` |
| glyphPrefix     | The icon library's base class      | `(none)``     | `fa` (see icon library's documentation) |
| shape           | Shape of the marker (css class)    | `(none)`      |`'square'`, `'pin'`, or `'penta'` |


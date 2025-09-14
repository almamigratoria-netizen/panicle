# Panicle data files

Data files for panicle are [JSON5](https://www.json5.org) format.  Since most 
web servers don't seem to be configured to provide the correct "content-type", 
we use the .json extension.


```json5
// OK, Pizza.  Pizza is good.
// Options are covered in the file "DataFiles.md"
{
    Zampano: {
        Marker: {
            icon: 'bx-pizza-alt',
            markerColor: 'red',
            shape: 'square',
            prefix: 'bx,'
        },
        Location: [-25.286187,-57.632438],
        Link: "https://www.instagram.com/zampanopizzeria/?hl=en"
    },
    "Pizzaria Don Maria": {
        Location: [-25.290438,-57.634812],
        Link: "https://www.instagram.com/donmariopy/"
    },
} 
// vim: syntax=json5
```
## Options

## Marker Options
Full documentation can be found in the documentation for [Leaflet.ExtraMarkers](https://github.com/coryasilva/Leaflet.ExtraMarkers), but these are the ones you probably need.

| Property        | Description                                 | Default Value | Possible  values                                     |
| --------------- | ------------------------------------------- | ------------- | ---------------------------------------------------- |
| icon            | Name of the icon **with** prefix            | `''`          | `fa-coffee` (see icon library's documentation)  |
| iconColor       | Color of the icon                           | `'white'`     | `'white'`, `'black'` or css code (hex, rgba etc) |
| markerColor     | Color of the marker (css class)             | `'blue'`      | `'red'`, `'orange-dark'`, `'orange'`, `'yellow'`, `'blue-dark'`, `'cyan'`, `'purple'`, `'violet'`, `'pink'`, `'green-dark'`, `'green'`, `'green-light'`, `'black'`, `'white'`, or color hex code **if `svg` is true** |
| prefix          | The icon library's base class               | `'glyphicon'` | `fa` (see icon library's documentation) |
| shape           | Shape of the marker (css class)             | `'circle'`    | `'circle'`, `'square'`, `'star'`, or `'penta'` |



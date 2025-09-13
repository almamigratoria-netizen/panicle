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


![Demo](doc/leaflet-sidebar-v2.gif)

## Why the Fork?
- BootLeaf used BootStrap 3.  So update to a newer [BootStrap](https://getbootstrap.com)
- [typeahead.js](https://twitter.github.io/typeahead.js/) hasn't beeb updated in 10 years, so we're replacing it with [awesomecomplete](https://projects.verou.me/awesomplete/)
- Eliminate [JQuery](https://youmightnotneedjquery.com/).  Because
  - The days of Internet Explorer are over.
  - I don't intend to slavishly update this codebase every time a new vulnerability surfaces, and JQuery has been called [one of the biggest security liabilites in modern software](https://www.blackduck.com/content/dam/black-duck/en-us/reports/rep-ossra.pdf), so.... you know...
- Make it easier to add your own data.  Well, at least it seems easier to me.
- provide a npm package `leaflet-sidebar-v2` with `main` and `style` fields in [`package.json`](package.json)

## Examples
in `examples` folder, available live at <https://noerw.github.io/leaflet-sidebar-v2/examples>

## Usage

### API
leaflet-sidebar-v2 provides a simple API to dynamically modify the sidebar. All functions may be chained.

#### creation
The parameters object is fully optional. The default values are shown:

```js
var sidebar = L.control.sidebar({
    autopan: false,       // whether to maintain the centered map point when opening the sidebar
    closeButton: true,    // whether t add a close button to the panes
    container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
    position: 'left',     // left or right
}).addTo(map);
```

#### modification

```js
/* add a new panel */
var panelContent = {
    id: 'userinfo',                     // UID, used to access the panel
    tab: '<i class="fa fa-gear"></i>',  // content can be passed as HTML string,
    pane: someDomNode.innerHTML,        // DOM elements can be passed, too
    title: 'Your Profile',              // an optional pane header
    position: 'bottom'                  // optional vertical alignment, defaults to 'top'
};
sidebar.addPanel(panelContent);

/* add an external link */
sidebar.addPanel({
    id: 'ghlink',
    tab: '<i class="fa fa-github"></i>',
    button: 'https://github.com/noerw/leaflet-sidebar-v2',
});

/* add a button with click listener */
sidebar.addPanel({
    id: 'click',
    tab: '<i class="fa fa-info"></i>',
    button: function (event) { console.log(event); }
});

/* remove a panel */
sidebar.removePanel('userinfo');

/* en- / disable a panel */
sidebar.disablePanel('userinfo');
sidebar.enablePanel('userinfo');
```

#### open / close / show content
```js
/* open a panel */
sidebar.open('userinfo');

/* close the sidebar */
sidebar.close();
```

#### remove sidebar

```js
/* remove the sidebar (keeping the sidebar container) */
sidebar.remove();
sidebar.removeFrom(map); // leaflet 0.x

/* to clear the sidebar state, remove the container reference */
sidebar._container = null
```

### markup
If you use the sidebar with static content only, you can predefine content in HTML:

```html
<div id="sidebar" class="leaflet-sidebar collapsed">
    <!-- Nav tabs -->
    <div class="leaflet-sidebar-tabs">
        <ul role="tablist"> <!-- top aligned tabs -->
            <li><a href="#home" role="tab"><i class="fa fa-bars"></i></a></li>
            <li class="disabled"><a href="#messages" role="tab"><i class="fa fa-envelope"></i></a></li>
            <li><a href="#profile" role="tab"><i class="fa fa-user"></i></a></li>
        </ul>

        <ul role="tablist"> <!-- bottom aligned tabs -->
            <li><a href="#settings" role="tab"><i class="fa fa-gear"></i></a></li>
        </ul>
    </div>

    <!-- Tab panes -->
    <div class="leaflet-sidebar-content">
        <div class="leaflet-sidebar-pane" id="home">
            <h1 class="leaflet-sidebar-header">
                sidebar-v2
                <div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div>
            </h1>
            <p>A responsive sidebar for mapping libraries</p>
        </div>

        <div class="leaflet-sidebar-pane" id="messages">
            <h1 class="leaflet-sidebar-header">Messages<div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div></h1>
        </div>

        <div class="leaflet-sidebar-pane" id="profile">
            <h1 class="leaflet-sidebar-header">Profile<div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div></h1>
        </div>
    </div>
</div>
```

You still need to initialize the sidebar (see API.creation)

### Events

The sidebar fires 3 types of events:
`opening`, `closing`, and `content`.
The latter has a payload including the id of the activated content div.

You can listen for them like this:
```js
sidebar.on('content', function(e) {
    // e.id contains the id of the opened panel
})
```


## License

Panicle is free software, and may be redistributed under the [MIT license](LICENSE).

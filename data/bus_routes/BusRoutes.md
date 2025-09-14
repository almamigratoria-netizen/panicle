# Bus Routes
There are probably a hundred places to get public transport routes.  Your
local government department of transportation can probably provide you with
information.  I got the ones I used from [OpenStreetMap](https://www.openstreetmap.org) data extracted using the OverPass API, and created this little helper to simplify my workflow.  I usually don't like just throwing large libraries at a problem, but I told myself I wasn't going to put more than one afternoon into this, so....

# Workflow
- Open up [OpenStreetMap](https://www.openstreetmap.org) in your browser.  Move
and zoom the map as required to get your area of interest.
- Turn on the "Transport Map" layer using the little layers button on the control bar.
- Pick a bus line using the "Query Features" tool.  You'll also get a lot of features that aren't your bus line, but read down the list until you find one that looks like it might be it.  Click it.
- You'll get a map showing the entire route.  IF that looks like what you're after, copy or jot down the relation number.
- Lots of ways to go from here, but mostly they're wrapped in the "BusRoutes.html" mini single-page.  This downloads the OSMJson from [overpass-turbo.eu](https://www.overpass-turbo.eu), converts it to geoJSON using [osmtogeojson](https://github.com/tyrasd/osmtogeojson), strips a lot of fluff (stoplights and speedbumps, extraneous properties of the line segments, etc), simplifies the line segments using [turf.js](https://turfjs.org), and allows you to download it.
- Open up the page (refresh if you're doing multiple lines), paste the relation number into the input box, click "Process it!", wait a bit while it does stuff.  It'll display the route on a map.  The "Process it!" button will change to "Download".  Click that.  Presto!  You get geoJSON.

# Room to grow
So like I mentioned, this was a "one-afternoon" project, so it could use some dressing up.  Some of the things on my roadmap are 
- tossing in [iziToast](https://marcelodolza.github.io/iziToast/) or something similar to show a few progress points.
- Better error checking, Error catching, etc.
- Better CSS
- Parsing the line segments in the geoJSON, dissolving the various MultiLineString and LineString geometries into just one or two lines.  This would give us some good size reduction and would make the "simplify" step a lot more effective.  - Once we're down a reasonably low number of lines, use Google-style polyline encoding to even further crunch the data down.  I'm not saying saving 50k is going to make a difference with common hardware and internet connections, but it might be important if someone wanted to use this on mobile.

# Sponsorship Opportunities
This was intended as a way to add a couple data files to the example data for the [panicle]() project.  I hadn't intended to further develop or maintain this.  I just thought someone else might find it useful.  If anyone wants to sponsor a feature, please feel free to note that in your Issue on this project's GitHub.  Thanks to Trump I'm semi-retired, so if your idea peaks my interest we'll probably be able to work something out.

## License
BusRoutes.html is free software, and may be redistributed under the [MIT license](LICENSE).  Some of the included javascript libraries may use different licenses.  Caveat Emptor.

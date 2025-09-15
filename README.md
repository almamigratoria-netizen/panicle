# Panicle
I was staying at a brand new Hostel in Asuncion, and most of the other people coming in and out were from Argentina and didn't know where to find a supermarket, cafe, decent pizza, or bus card.  I thoughit posting a QR code to a map might be helpful.   

This project was inspired by Brian McBride's interesting [BootLeaf](https://github.com/bmcbride/bootleaf) project.  A panicle is a leaf boot, hence the name.
 
## Why the reboot?
- BootLeaf used [BootStrap](https://getbootstrap.com) 3.  When I tried to replace that with a newer version, it quickly became obvious that it would be easier to start from scratch than to update all the bootstrap tags and classes to match the new idioms.
- [typeahead.js](https://twitter.github.io/typeahead.js/) hasn't beeb updated in 10 years (that's forever in Internet years), so... yeah.. it's gone, too.
- Eliminate [JQuery](https://youmightnotneedjquery.com/).  Because
  - The days of Internet Explorer are over.
  - JQuery has been called [one of the biggest security liabilites in modern software](https://www.blackduck.com/content/dam/black-duck/en-us/reports/rep-ossra.pdf), so.... you know...
  - I prefer to know what my code is doing under the hood.
- Make it easier to add your own data.  Well, at least it seems easier to me.

## Using your data
The file `panicle.json5` lets you set several options and define 
a set of JSON files to load.  Each file becomes a map layer and gets added to
the layer control.  See the example data files and the 
[README](./data/README.md) in the `data` directory.

## Some assembly required
As of September 2025, this is still a work in progress.  It's useful enough
to post for others, but I'm using github as my RCS.  There's more features
planned (like implementing the search functionality).
A lot of the bones are done.  Flesh still needs some work.

There's a dropdown on the navbar that by deafult says things like `Action` and
`Something else here`.  That, obviously, needs to get tweaked by hand 
by whomver is deploying one of thses.  Also the file `navbar.js` is pretty
much just a hollow framework, mostly demonstrating a fairly easy-to-understand
way to handle the clicks.  Anything the deployer wants to implement, well, 
that's up to them.


### Footnote
- When I was almost done with this project, I found a newer project that calls itself BootLeaf, also updated (somewheat) and with tons of ArcGIS features tossed in.  If that interests you, you can find it at [bootleaf.xyz](https://bootleaf.xyz).
## LicenPanicle is free software, and may be redistributed under the [MIT license](LICENSE).

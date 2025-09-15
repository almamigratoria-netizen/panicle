//
// navbar.js
//
// Code for handling the items on the navbar (dropdown, search, etc)
// Returns an object holding public methods
// Side effect of attaching click handlers to whatever items you
// code in here.
//
//

const navbar = (function() {
    // No click handler is HTML'd to the items on the navbar.
    // We need to correct that.  I've found this to be a fairly
    // simple and extensible method.
    const setup = function() {
        try {
          document.getElementById("item1").addEventListener("click", item1);
          document.getElementById("item2").addEventListener("click", item2);
          document.getElementById("item3").addEventListener("click", item3);
          let el = document.getElementById("searchbutton");
          if (el) { el.addEventListener("click", searchbutton); }
          document.getElementById("about").addEventListener("click", about);
        } catch(e) {
          console.error(e);
        }
        // This version of Bootstrap seems to have a bug that
        // raises aria issues with modals.  This calms them down.
        // Probably will get fixed in a future Bootstrap, but for now...
        window.addEventListener('hide.bs.modal', () => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }); 
    };


    // The argument "e" (the event) gets supplied automagically
    // Unless you're calling the function yourself (for some reason).
    const item1 = function(e) {
        // Example of displaying a Bootstrap modal on menu click.
        if (!e.target) {return;}
        try {
            const el = document.getElementById("modal_1");
            const m = bootstrap.Modal.getOrCreateInstance(el);
            m.show();
        } catch(e) {
            console.warn(e);
        }
    };

    const item2 = function(e) {
        if (!e.target) {return;}
        console.log(e.target.textContent.trim(), " clicked")
    };

    const item3 = function(e) {
        if (!e.target) {return;}
        console.log(e.target.textContent.trim(), " clicked")
    };

    const about = function(e) {
        if (!e.target) {return;}
        console.log(e.target.textContent.trim(), " clicked")
    };

    const searchbutton = function(e) {
        if (!e.target) {return;}
        console.log(e.target.textContent.trim(), " clicked")
    };

    setup();

    // Can't think of why anyone would need the methods, but it's part of my
    // standard IEFE boilerplate so I'm leaving it.
    return { // (probably useless) list of the "I got clicked" functions.    
        item1: item1,
        item2: item2,
        item3: item3,
        searchbutton: searchbutton,
        about: about,
    };
})();

// You'll have to get your own openexchagerates app_id if you want to
// use this, but here's the basic idea:
const exchange_rate = (async function() {
    // get el for item3
    // ajax 
    // https://openexchangerates.org/api/latest.json?app_id={app_id}
    // Fiddle with some math if you want to convert, like, Euro to NZD
    // Replace the text for "Some other action"
})();
// https://openexchangerates.org/api/latest.json?app_id=0fc7174b77a345f68bcbeae2448f57bb
// Not really sure why we want and/or need a reference to this, but I always
// like to have one just in case.
export default navbar;

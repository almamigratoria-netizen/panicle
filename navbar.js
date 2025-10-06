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
          // notice that we're not attaching a click to item3.
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
        // Example of displaying a Bootstrap modal on menu click.
        if (!e.target) {return;}
        try {
            const el = document.getElementById("modal_2");
            const m = bootstrap.Modal.getOrCreateInstance(el);
            m.show();
        } catch(e) {
            console.warn(e);
        }
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
        searchbutton: searchbutton,
        about: about,
    };
})();

// Menu items don't have to trigger any actions, sometimes
// they're useful just to display information
const exchange_rate = (async function() {
    // This replaces the text contents of "item3" with
    // some exchange rate information.
    const el = document.getElementById('item3');
    if (!el) {
        console.log("Cant find element for \"item3\"");
        return;
    }

    const url = "https://www.floatrates.com/daily/usd.json";
    let j = {};
    try {
        const r = await fetch(url);
        if (!r.ok) {
            console.log(r);
            return;
        }
        j = JSON5.parse(await r.text());
    } catch(e) { 
        console.error(e.message);
        j = {};  // just in case JSON5 messed with it
    };
    let ex_strings = [
        "...sorry...failed to load",
        "exchange rates. :-("
    ];
    if (Object.keys(j).length) {
        const ars = j.ars.rate;
        const pyg = j.pyg.rate;
        ex_strings = [
            "1000 ARS = " + Math.round(pyg/ars * 1000) + " PYG",
            "1 USD = " + Math.round(pyg) + " PYG",
        ];
    };

    // When called, toggles exchange rate from ARS->PYG to USD->PYG
    let update_state = 0;
    function update() {
        el.textContent = ex_strings[update_state];
        update_state = (update_state + 1) % 2; // simple toggle
    }
    update();  // Set initial text
    const intervalID = window.setInterval(update, 2000);
})();


// Not really sure why we want and/or need a reference to this, but I always
// like to have one just in case.
export default navbar;

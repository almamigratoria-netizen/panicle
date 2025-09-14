//
// navbar.js
//
// Code for handling the items on the navbar (dropdown, search, etc)
//
//

const navbar = (function() {
    // No click handler is connected to the items on the navbar.
    // We need to correct that.  We could do it in the HTML, but
    // that's not how I roll.
    const setup = function() {
        let el;
        el = document.getElementById("item1");
        if (el) { el.addEventListener("click", item1); }
        el = document.getElementById("item2");
        if (el) { el.addEventListener("click", item2); }
        el = document.getElementById("item3");
        if (el) { el.addEventListener("click", item3); }
        el = document.getElementById("searchbutton");
        if (el) { el.addEventListener("click", searchbutton); }
        el = document.getElementById("about");
        if (el) { el.addEventListener("click", about); }
        // This version of Bootstrap seems to have a bug that
        // raises aria issues.  This calms them down.  Probably will
        // get fixed in a future Bootstrap release, but for now....
        window.addEventListener('hide.bs.modal', () => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }); 
    };

    // The argument "e" (the event) gets supplied automagically
    // Unless you're calling the function yourself (for some reason).
    const item1 = function(e) {
        if (!e.target) {return;}
        try {
            const el = document.getElementById("modal_1");
            const m = bootstrap.Modal.getOrCreateInstance(el);
            m.show();
        } catch(e) {
            console.log(e);
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

    return {
        item1: item1,
        item2: item2,
        item3: item3,
        searchbutton: searchbutton,
    };
})();

// Not really sure why we want and/or need a reference to this, but I always
// like to have one just in case.
export default navbar;

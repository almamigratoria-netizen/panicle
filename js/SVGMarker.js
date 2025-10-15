// 
// SVGMarkers.js
//
// ESM for Leaflet v2 to create css styled SVG markers.
//
// Exports two classes: SVGMarker (the default) and SVGIcon.
// SVGMarker is really just a convenience that over-rides the icon.  
// SVGIcon is where the magic happens.
// LatLng for marker can be a Plus Code (google style Open Location Code)
// ... has to be a full 10 digit code.
//
// This module was created not so much to use SVG icons instead of the
// default, but so that I could learn a bit about writing modules for 
// leaflet v2 and a few things about SVG's.
//
// I learned that SVG's in <img> tags can't use external <use> or external CSS
// That's sad.  We'll (eventually) tweaking the Marker class and try not 
// using <img> tags, but returning <svg> directly.  
// Not sure if that'll buy us anything, but we'll try.

// tree shaking ?
import {Marker, Icon, LatLng, Util} from "./leaflet.js";

class SVGMarker extends Marker {
    initialize(latlng, options) {
        this.name = SVGMarker;
        Util.setOptions(this, options);
        this.options.icon = new SVGIcon(options);
        this._latlng = new LatLng(latlng);
    }
}

// Deserialized on module load, so changing this chages the default icon
const default_svgText = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" class="leaflet-zoom-animated leaflet-interactive leaflet-SVGIcon" style="width:25px">
  <circle cx="12.5" cy="12.5" r="11.5"/>
  <path d="M0.1 13 12.5 41 24.9 13"/>
  <circle class="markerDot" cx="12.5" cy="12.5" r="5"/>
</svg>
`;
let default_SVGIcon = undefined;
(function() {
    // tiny polyfill for trustedTypes.  Do we want this?
    // if (typeof trustedTypes == 'undefined') {
    //     trustedTypes = {createPolicy:(n, rules) => rules};
    // }
    
    const ourCSS = `
.leaflet-SVGIcon {
  fill: #267fca;
  stroke: blue;
  width: 25px;
  height: 41px;
}

.leaflet-SVGIcon .markerDot {
  fill:white;
  stroke:blue;
}

.leaflet-SVGIcon .glyph {
  position: relative;
/*  left: 0px; */ 
  color: white;
  width: 25px;
  text-align: center;
  vertical-align: middle;
}
`;
    const _writeCSS = function() {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(ourCSS);
        document.adoptedStyleSheets.push(sheet);
    }

    _writeCSS();    
    try {
        default_SVGIcon = SVGIcon.svgDeserialize(default_svgText);
    } catch (e) {
        console.warn(e.message);
    }
})();

const defaultOptions = {
    iconSize:    [25, 41],
    iconAnchor:  [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize:  [41, 41],
};

class SVGIcon extends Icon {
    // Icon has the following methods:
    // static{} section with setDefaultOptions()
    // initialize() which calls setOptions
    // createIcon(oldIcon?: HTMLElement), returns an <img> 
    // createShadow(oldIcon).  For these two not entirely sure what
    // "oldIcon" does.
    //
    // We'll over-ride createIcon, createShadow and
    // add...
    // _createSVGIcon
    // _svgSerialize
    // _svgD6eserialize
    // _svgToDataURL

    static {
    }

    // Convert an SVG Element to a string.
    static serializeSVG(svgElement) {
        // check if arg === element.  Could also allow selectors.
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        return svgString;
    }

    // Create a dataURL from an SVG for use as img.src
    // Deprecated: leave it as an aux function.
    static svgToDataURL(inputSVG) {
        if (inputSVG instanceof SVGSVGElement) {
            inputSVG = this.serializeSVG(inputSVG);
        }
        // Not unicode safe.  Do we care?  Are we caring about this?
        const base64 = btoa(inputSVG);
        const s = `data:image/svg+xml;base64,${base64}`;
        return s;
    }

    // There's no standardized feature detection to determine if 
    // you need TrustedHTML for XSS sinks like DOMParser.
    static svgDeserialize(svgString, options={}) {
        const el = document.createElement('p');
        let needTrustedHTML = false;
        // You can try poking .innerHTML
        try {
            el.innerHTML = 'foo';
        } catch (e) {
            // if it throws a TypeError, you (probably) need TrustedHTML
            if (e instanceof TypeError && document.trustedTypes) {
                needTrustedHTML = true;
            }
        }
        if (needTrustedHTML == false || 
            svgString instanceof TrustedHTML) {
            // Safe to use DOMParser()
            return SVGIcon.DOM_svgDeserializer(svgString, options);
        }
        // Sorta-OK SVG Parser.  Could be easy to break, but handles
        // what I've thrown at it so far.
        return this.kludge_svgDeserializer(svgString, options);
    }

    static DOM_svgDeserializer(svgString, options={}) {
        // console.info("trust svgString? ", svgString instanceof TrustedHTML);
        const Dp = new DOMParser();
        const svgDoc = Dp.parseFromString(svgString, 'image/svg+xml');
        if (svgDoc.querySelector("parsererror")) {
            return null;
        }
        return svgDoc.documentElement;
    }

    static svgMaker(tag, attrs) {
        if (tag.startsWith("/")) { return null; }
        const svgNS = "http://www.w3.org/2000/svg";
        const el = document.createElementNS(svgNS, tag);
        for (const key in attrs) {
            el.setAttributeNS(svgNS, key, attrs[key]);
        }
        return el;
    }

    // This is a kludge.  You really can't parse XML with regex.
    // But it was fun to build.
    static kludge_svgDeserializer(svgString, options={}) {
        // Use a stack instead of recursion.  Might refactor it later. 
        let tagStack = []; 
        // /<(\w+)([^>]*)>.*?</\1>/   (Doesn't match self-closers)
        const re_tag = /<\s*(?<tagclose>[\/])?\s*(?<tag>\/?\w+)\s*(?<attribs>[^>]*)?>/g;
        // ideally re_tag would incorporate the attributes RE, group
        // it as ?<attribs>, and match 0 or more instances.
        const re_attrib = /((?<key>\w+)\s*=\s*(?<value>['"][^'"]*?['"]))/g;
        // ideally our re_tag would detect self-closers as well.
        const re_selfClose = /\/\s*>/;
        let match = svgString.matchAll(re_tag);
        const allMatches = Array.from(match);
        for (const match of allMatches) {
            const { tagclose, tag, attribs } = match.groups;
            let attrs = {};
            if (attribs?.length) {
                let attr_match = attribs.matchAll(re_attrib);
                const allAttrs = Array.from(attr_match);
                for (const one_attr of allAttrs) {
                    const {key, value} = one_attr.groups;
                    attrs[key.replace('"', '')] = value.slice(1,-1);
                }
            }
            let el = SVGIcon.svgMaker(tag, attrs);
            if (match[0].match(re_selfClose) || tagclose) {
                // tag closed.  Append to parent.
                if (tagStack.length > 1) {
                    tagStack.pop();
                    tagStack.at(-1).appendChild(el);
                }
            } else {
                // tag not closed, so next element is a child
                tagStack.push(el);
            }
        }
        return tagStack.pop();
    }

    // Available options are:
    // border: stroke color
    //
    // ROADMAP: shape: <nyi, but shortcut for one of our svg's>
    // ROADMAP: svg: <string> or element (could just be a "use")
    _createSVGIcon(options) {
        let icon = default_SVGIcon.cloneNode(true);  // unless svg? or shape?
        let dwifs = false;
        for (const [key, value] of Object.entries(options)) {
            // These keys handled by another key's handler
            if (['glyphColor'].includes(key)) { continue; }
            if (key == 'dwifs') {
                dwifs = value;
                if (dwifs) {
                    console.warn("dwifs = ${value}");
                    console.warn(".... This voids the warranty!");
                }
            } else if (key == 'color') { 
                // can I setAttributeNS on the icon itself?
                if (CSS.supports('color', value)) {   // what if it's a url?
                    icon.querySelector('circle').setAttribute('fill', value);
                    icon.querySelector('path').setAttribute('fill', value);
                } else { console.warn(`color ${value} not supported`); }
            } else if (key == "class") {
                icon.classList.add(value);
            } else if (key == 'dotColor') { 
                let el = icon.querySelector('.markerDot');
                if (CSS.supports('color', value)) {   // what if it's a url?
                    el?.setAttribute('style', `fill:${value};`);
                } else { console.warn(`color ${value} not supported`); }
            } else if (key == 'glyph') {
                // ROADMAP:  They may have passed us an SVG, not a name
                let glyphPrefix = options.glyphPrefix || value.split('-')[0];
                let i = document.createElement('i');
                i.className = `${glyphPrefix} ${value} glyph`;
                i.style.color = options.glyphColor || 'white';

                let foreign = SVGIcon.svgMaker('foreignObject', {x:0,y:0});
                foreign.style.height = `${this.options.iconSize[1]}px`;
                foreign.style.width = `${this.options.iconSize[0]}px`;
                foreign.appendChild(i);
                icon.appendChild(foreign);
                // remove the white dot when we use an icon
                icon.querySelector('.markerDot').remove();
            } else if (key == 'style') {  // Style sheet, not attribute
                // Preferred method is to provide a <style> object
                if (value.tagName?.toLowerCase() == 'style') {
                    icon.prepend(value);
                } else if (typeof value === 'string') {
                    const style = SVGIcon.svgMaker('style');
                    style.append(value);
                    icon.prepend(style);
                } else {
                    console.warn("style attribute cannot be %o", value);
                }
            } else if (key == 'border') {
                for (const child of icon.children) {
                    child.style.stroke = value;
                }
            } else if (key == 'shape') {
                console.info("shape attribute not yet supported");
            } else {
                if (dwifs) {  // dangerous, but can be really useful
                    for (const child of icon.children) {
                        child.style[key] = value;
                    }
                }
                console.log(`${key}: ${value}`);
            }
        }

        // Validate color:
        //     CSS.supports('color', '#007')
        return icon;
    }

    createIcon() {
        const options = this._options || {};
        let icon;
        if (!Object.keys(options).length) { 
            icon = default_SVGIcon.cloneNode(true);  // No options.  Default.
        } else {
            icon = this._createSVGIcon(options);
        }
        const anchor = this.options.iconAnchor;
        icon.style.marginLeft = `${-anchor[0]}px`;
        icon.style.marginTop  = `${-anchor[1]}px`;
        return icon;
    }

    // Marker has a .createShadow() function.  Maybe over-ride it?
    // The idea is take the icon, make all fill/stoke some graying color,
    // rotate it about the point, blur it.
    createSVGShadow(options) {
        const j = JSON.stringify(options);
        console.log(`createShadow(${j})`);
        // console.log("Call Stack: ", new Error().stack);
    }

    initialize(options) {
        if (!default_SVGIcon) {
            default_SVGIcon = SVGIcon.svgDeserialize(default_svgText);
        }
        this.name = SVGIcon;
        this._options = options;
        this.options = {...defaultOptions, ...options}
    }
}

default_SVGIcon = SVGIcon.svgDeserialize(default_svgText);
export {SVGMarker as default, SVGIcon};

//class Icon extends Class {
//	static {
//		this.setDefaultOptions({
//			popupAnchor: [0, 0],
//			tooltipAnchor: [0, 0],
//			crossOrigin: false
//		});
//	}

//	initialize(options) {
//		setOptions(this, options);
//	}

	// @method createIcon(oldIcon?: HTMLElement): HTMLElement
	// Called internally when the icon has to be shown, returns a `<img>`
    // ***********  Actually called by Marker ****************************
//	createIcon(oldIcon) {
//		return this._createIcon('icon', oldIcon);
//	}

//	createShadow(oldIcon) {
//		return this._createIcon('shadow', oldIcon);
//	}

//	_createIcon(name, oldIcon) {
//		const src = this._getIconUrl(name);
//		if (!src) {
//			if (name === 'icon') { throw new Error('iconUrl not set'); }
//			return null;
//		}
//		const img = this._createImg(src, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null);
//		this._setIconStyles(img, name);
//		if (this.options.crossOrigin || this.options.crossOrigin === '') {
//			img.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
//		}
//		return img;
//	}

//	_setIconStyles(img, name) {
//		const options = this.options;
//		let sizeOption = options[`${name}Size`];
//		if (typeof sizeOption === 'number') {
//			sizeOption = [sizeOption, sizeOption];
//		}
//		const size = Point.validate(sizeOption) && new Point(sizeOption);
//		const anchorPosition = name === 'shadow' && options.shadowAnchor || options.iconAnchor || size && size.divideBy(2, true);
//		const anchor = Point.validate(anchorPosition) && new Point(anchorPosition);
//		img.className = `leaflet-marker-${name} ${options.className || ''}`;
//		if (anchor) {
//			img.style.marginLeft = `${-anchor.x}px`;
//			img.style.marginTop  = `${-anchor.y}px`;
//		}
//		if (size) {
//			img.style.width  = `${size.x}px`;
//			img.style.height = `${size.y}px`;
//		}
//	}

//	_createImg(src, el) {
//		el ??= document.createElement('img');
//		el.src = src;
//		return el;
//	}

//	_getIconUrl(name) {
//		return Browser.retina && this.options[`${name}RetinaUrl`] || this.options[`${name}Url`];
//	}
//}



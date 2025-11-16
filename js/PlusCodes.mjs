// OpenLocationCode original copyright 2014 Google Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
//

/**
 * Plus Codes are short, 10-11 character codes that can be used instead
 * of street addresses. The codes can be generated and decoded offline, and use
 * a reduced character set that minimises the chance of codes including words.
 *
 *   Encode a location, default accuracy:
 *   var code = OpenLocationCode.encode(47.365590, 8.524997);
 *
 *   Encode a location using one stage of additional refinement:
 *   var code = OpenLocationCode.encode(47.365590, 8.524997, 11);
 *
 *   Decode a full code:
 *   var c = OpenLocationCode.decode(code);
 *   var msg = 'Center is ' + c.latitudeCenter + ',' + c.longitudeCenter;
 *
 *   var shortCode = OpenLocationCode.shorten('8FVC9G8F+6X', 47.5, 8.5);
 *
 *   Recover the full code from a short code:
 *   var code = OpenLocationCode.recoverNearest('8F+6X', 47.4, 8.6);
 */

// Wanted to use Google's code in a project where I wanted everything
// as ESM, so tweaked it to ESM style, etc.  Dropped commonjs wrapper
//
const OpenLocationCode = (function() {
    let OpenLocationCode = {};
    OpenLocationCode.CODE_PRECISION_NORMAL = 10;
    OpenLocationCode.CODE_PRECISION_EXTRA = 11;
    let CODE_ALPHABET_ = '23456789CFGHJMPQRVWX';
    let PAIR_RESOLUTIONS_ = [20.0, 1.0, .05, .0025, .000125];
    let FINAL_LAT_PRECISION_ = 8000 * Math.pow(5, 5);
    let FINAL_LNG_PRECISION_ = 8000 * Math.pow(4, 5);

    OpenLocationCode.getAlphabet = function() {
        return CODE_ALPHABET_;
    };

    let isValid = function(code) {
        if (!code || typeof code !== 'string') { return false; }
        if (code.indexOf('+') == -1) { return false; }
        if (code.indexOf('+') != code.lastIndexOf('+')) { return false; }
        if (code.length == 1) { return false; }
        if (code.indexOf('+') > 8 ||
            code.indexOf('+') % 2 == 1) {
            return false;
        }
        if (code.indexOf('0') > -1) {
            // Short codes cannot have padding
            if (code.indexOf('+') < 8) { return false; }
            if (code.indexOf('0') == 0) { return false; }
            let padMatch = code.match(new RegExp('(' + '0' + '+)', 'g'));
            if (padMatch.length > 1 || padMatch[0].length % 2 == 1 ||
                padMatch[0].length > 6) {
                return false;
            }
            if (code.charAt(code.length - 1) != '+') { return false; }
        }
        if (code.length - code.indexOf('+') - 1 == 1) { return false; }

        code = code.replace(new RegExp('\\' + '+' + '+'), '')
                   .replace(new RegExp('0' + '+'), '');
        for (let i = 0, len = code.length; i < len; i++) {
            let character = code.charAt(i).toUpperCase();
            if (character != '+' && CODE_ALPHABET_.indexOf(character) == -1) {
                return false;
            }
        }
        return true;
    };

    let isShort = OpenLocationCode.isShort = function(code) {
        // Check it's valid.
        if (!isValid(code)) {
            return false;
        }
        if (code.indexOf('+') >= 0 &&
                code.indexOf('+') < 8) {
            return true;
        }
        return false;
    };

    let isFull = OpenLocationCode.isFull = function(code) {
        if (!isValid(code)) {
            return false;
        }
        if (isShort(code)) {
            return false;
        }

        let firstLatValue = CODE_ALPHABET_.indexOf(
                code.charAt(0).toUpperCase()) * 20;
        if (firstLatValue >= 90 * 2) {
            return false;
        }
        if (code.length > 1) {
            let firstLngValue = CODE_ALPHABET_.indexOf(
                    code.charAt(1).toUpperCase()) * 20;
            if (firstLngValue >= 180 * 2) {
                return false;
            }
        }
        return true;
    };

    let encode = function(latitude, longitude, codeLength) {
        latitude = Number(latitude);
        longitude = Number(longitude);
        const locInts = locationToIntegers(latitude, longitude);
        return encodeIntegers(locInts[0], locInts[1], codeLength);
    };

    let locationToIntegers = function(latitude, longitude) {
        let latVal = Math.floor(latitude * FINAL_LAT_PRECISION_);
        latVal += 90 * FINAL_LAT_PRECISION_;
        if (latVal < 0) {
            latVal = 0;
        } else if (latVal >= 2 * 90 * FINAL_LAT_PRECISION_) {
            latVal = 2 * 90 * FINAL_LAT_PRECISION_ - 1;
        }
        let lngVal = Math.floor(longitude * FINAL_LNG_PRECISION_);
        lngVal += 180 * FINAL_LNG_PRECISION_;
        if (lngVal < 0) {
            lngVal =
                (lngVal % (2 * 180 * FINAL_LNG_PRECISION_)) +
                2 * 180 * FINAL_LNG_PRECISION_;
        } else if (lngVal >= 2 * 180 * FINAL_LNG_PRECISION_) {
            lngVal = lngVal % (2 * 180 * FINAL_LNG_PRECISION_);
        }
        return [latVal, lngVal];
    };

    let encodeIntegers = OpenLocationCode.encodeIntegers = function(latInt, lngInt, codeLength) {
        if (typeof codeLength == 'undefined') {
            codeLength = OpenLocationCode.CODE_PRECISION_NORMAL;
        } else {
            codeLength = Math.min(15, Number(codeLength));
        }
        if (isNaN(latInt) || isNaN(lngInt) || isNaN(codeLength)) {
            throw new Error('ValueError: Parameters are not numbers');
        }
        if (codeLength < 2 ||
                (codeLength < 10 && codeLength % 2 == 1)) {
            throw new Error('IllegalArgumentException: Invalid Open Location Code length');
        }
        const code = new Array(15 + 1);
        code[8] = '+';

        // Compute the grid part of the code if necessary.
        if (codeLength > 10) {
            for (let i = 5; i >= 1; i--) {
                let latDigit = latInt % 5;
                let lngDigit = lngInt % 4;
                let ndx = latDigit * 4 + lngDigit;
                code[10+i] = CODE_ALPHABET_.charAt(ndx);
                latInt = Math.floor(latInt / 5);
                lngInt = Math.floor(lngInt / 4);
            }
        } else {
            latInt = Math.floor(latInt / Math.pow(5, 5));
            lngInt = Math.floor(lngInt / Math.pow(4, 5));
        }

        code[9] = CODE_ALPHABET_.charAt(latInt % 20);
        code[10] = CODE_ALPHABET_.charAt(lngInt % 20);
        latInt = Math.floor(latInt / 20);
        lngInt = Math.floor(lngInt / 20);

        for (let i = 10 / 2 + 1; i >= 0; i -= 2) {
            code[i] = CODE_ALPHABET_.charAt(latInt % 20);
            code[i + 1] = CODE_ALPHABET_.charAt(lngInt % 20);
            latInt = Math.floor(latInt / 20);
            lngInt = Math.floor(lngInt / 20);
        }

        if (codeLength >= 8) {
            return code.slice(0, codeLength + 1).join('');
        }
        return code.slice(0, codeLength).join('') +
                Array(8 - codeLength + 1).join('0') + '+';
    };

    let decode = OpenLocationCode.decode = function(code) {
        if (!isFull(code)) {
            throw new Error('IllegalArgumentException: ' +
                    'Passed Plus Code is not a valid full code: ' + code);
        }
        code = code.replace('+', '').replace(/0/g, '').toLocaleUpperCase('en-US');

        let normalLat = -90 * 8000;
        let normalLng = -180 * 8000;
        let gridLat = 0;
        let gridLng = 0;
        let digits = Math.min(code.length, 10);
        let pv = 160000;
        for (let i = 0; i < digits; i += 2) {
            normalLat += CODE_ALPHABET_.indexOf(code.charAt(i)) * pv;
            normalLng += CODE_ALPHABET_.indexOf(code.charAt(i + 1)) * pv;
            if (i < digits - 2) {
                pv /= 20;
            }
        }
        let latPrecision = pv / 8000;
        let lngPrecision = pv / 8000;
        if (code.length > 10) {
            let rowpv = 625;
            let colpv = 256;
            digits = Math.min(code.length, 15);
            for (let i = 10; i < digits; i++) {
                let digitVal = CODE_ALPHABET_.indexOf(code.charAt(i));
                let row = Math.floor(digitVal / 4);
                let col = digitVal % 4;
                gridLat += row * rowpv;
                gridLng += col * colpv;
                if (i < digits - 1) {
                    rowpv /= 5;
                    colpv /= 4;
                }
            }
            latPrecision = rowpv / FINAL_LAT_PRECISION_;
            lngPrecision = colpv / FINAL_LNG_PRECISION_;
        }
        let lat = normalLat / 8000 + gridLat / FINAL_LAT_PRECISION_;
        let lng = normalLng / 8000 + gridLng / FINAL_LNG_PRECISION_;
        return new CodeArea(
                lat,
                lng,
                lat + latPrecision,
                lng + lngPrecision,
                Math.min(code.length, 15));
    };

    let recoverNearest = function( shortCode, refLat, refLng) {
        if (!isShort(shortCode)) {
            if (isFull(shortCode)) {
                return shortCode.toUpperCase();
            } else {
                throw new Error(
                        'ValueError: Passed short code is not valid: ' + shortCode);
            }
        }
        refLat = Number(refLat);
        refLng = Number(refLng);
        if (isNaN(refLat) || isNaN(refLng)) {
            throw new Error('ValueError: Reference position are not numbers');
        }
        // Ensure that latitude and longitude are valid.
        refLat = clipLatitude(refLat);
        refLng = normalizeLongitude(refLng);
        shortCode = shortCode.toUpperCase();
        let paddingLength = 8 - shortCode.indexOf('+');
        let resolution = Math.pow(20, 2 - (paddingLength / 2));
        let halfResolution = resolution / 2.0;

        let codeArea = decode(
                encode(refLat, refLng).substr(0, paddingLength)
                + shortCode);
        if (refLat + halfResolution < codeArea.latitudeCenter &&
                codeArea.latitudeCenter - resolution >= -90) {
            codeArea.latitudeCenter -= resolution;
        } else if (refLat - halfResolution > codeArea.latitudeCenter &&
                             codeArea.latitudeCenter + resolution <= 90) {
            codeArea.latitudeCenter += resolution;
        }

        if (refLng + halfResolution < codeArea.longitudeCenter) {
            codeArea.longitudeCenter -= resolution;
        } else if (refLng - halfResolution > codeArea.longitudeCenter) {
            codeArea.longitudeCenter += resolution;
        }

        return encode(
                codeArea.latitudeCenter, codeArea.longitudeCenter, codeArea.codeLength);
    };

    OpenLocationCode.shorten = function(
            code, latitude, longitude) {
        if (!isFull(code)) {
            throw new Error('ValueError: Passed code is not valid and full: ' + code);
        }
        if (code.indexOf('0') != -1) {
            throw new Error('ValueError: Cannot shorten padded codes: ' + code);
        }
        code = code.toUpperCase();
        let codeArea = decode(code);
        if (codeArea.codeLength < 6) {
            throw new Error( 'ValueError: Code length must be at least 6');
        }
        latitude = Number(latitude);
        longitude = Number(longitude);
        if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error('ValueError: Reference position are not numbers');
        }
        latitude = clipLatitude(latitude);
        longitude = normalizeLongitude(longitude);
        let range = Math.max(
                Math.abs(codeArea.latitudeCenter - latitude),
                Math.abs(codeArea.longitudeCenter - longitude));
        for (let i = PAIR_RESOLUTIONS_.length - 2; i >= 1; i--) {
            if (range < (PAIR_RESOLUTIONS_[i] * 0.3)) {
                return code.substring((i + 1) * 2);
            }
        }
        return code;
    };

    let clipLatitude = function(latitude) {
        return Math.min(90, Math.max(-90, latitude));
    };

    let normalizeLongitude = function(longitude) {
        while (longitude < -180) {
            longitude = longitude + 360;
        }
        while (longitude >= 180) {
            longitude = longitude - 360;
        }
        return longitude;
    };

    let CodeArea = OpenLocationCode.CodeArea = function(
            latitudeLo, longitudeLo, latitudeHi, longitudeHi, codeLength) {
        return new OpenLocationCode.CodeArea.fn.Init(
                latitudeLo, longitudeLo, latitudeHi, longitudeHi, codeLength);
    };
    CodeArea.fn = CodeArea.prototype = {
        Init: function(
                latitudeLo, longitudeLo, latitudeHi, longitudeHi, codeLength) {
            this.latitudeLo = latitudeLo;
            this.longitudeLo = longitudeLo;
            this.latitudeHi = latitudeHi;
            this.longitudeHi = longitudeHi;
            this.codeLength = codeLength;
            this.latitudeCenter = Math.min(
                    latitudeLo + (latitudeHi - latitudeLo) / 2, 90);
            this.longitudeCenter = Math.min(
                    longitudeLo + (longitudeHi - longitudeLo) / 2, 180);
        },
    };
    CodeArea.fn.Init.prototype = CodeArea.fn;
    const OLC = {
        encode: encode,
        decode: decode,
        recoverNearest: recoverNearest,
        isValid: isValid,
    }
    return OLC;
})();


//
// PlusCodes.js
// Licensed under the Apache 2 License
// 
// Knowing the Lat/Lng of your reference points is so dull.    So my
// little hack/helper allows you to provide reference
// points as simple text.
// If you're trying to get short plus codes for Paris, Iowa but you
// just provide "Paris" as your reference, that's on you.
//
// Examples:
// buckingham_palace = await OLC.encode((51.5013,-0.1419, "London England");
// returns: { code: '9C3XGV25+G6', shortCode: 'GV25+G6'}
// buckingham_palace = await OLC.encode(51.5013,-0.1419); // no ref pt!
// returns: { code: '9C3XGV25+G6', shortCode: undefined}
// returns: { code: code, shortCode: shortCode}
// alexanderplatz = await OLC.decode("9F4MGCC9+CV"); // no ref: need full code
// returns: [52.521062, 13.419688]
// alexanderplatz = await OLC.decode("GCC9+CV", "Berlin, Germany");
// returns: [52.521062, 13.419688]
//
// NOTE:    Because I can't figure out any other way to do it (that doesn't
//                toss deprecation warnings) and these function MIGHT require
//                geolocation lookups, they're async.

const PlusCode = (function() {
    // Extremely naive geolocater that believes the first thing OSM tells it.
    const NOM = "nominatim.openstreetmap.org/search?format=json";
    async function geolocate(where) {
        const query = encodeURI(where);
        const URL = `https://${NOM}&q=${query}`;
        let j;
        try {
            const response = await fetch(URL);
            j = await response.json();
            return ([j[0].lat, j[0].lon]);
       } catch (e) {
            // let the next level up handle the error
            throw(e);
       }
    };

    async function encode(lat, lon, ref=undefined) {
        let {code, shortCode, error } = undefined || {};
        try {
            code = OpenLocationCode.encode(lat, lon);
        } catch (e) {
            console.error(`${e.name}: ${e.message}`);
        }
        if (ref) {
            try {
                const ll = await geolocate(ref);
                shortCode = OpenLocationCode.shorten(code, ll[0], ll[1]);
            } catch (e) {
                console.error(`${e.name}: ${e.message}`);
            }
        }

        const reply = {
            code: code,
            shortCode: shortCode,
            error: error,
        }
        return reply;
    };

    async function decode(code) {
        if (Array.isArray(code)) {
            return code;
        }
        const args = code.split(/\s+/);
        code = args[0];
        let ref = undefined;
        if (args.length > 1) {
            ref = args[1];
        }
        if (ref) {
            try {
                const p = await geolocate(ref);
                code = OpenLocationCode.recoverNearest(code, p[0], p[1]);
            } catch (e) {
                console.error(`${e.name}: ${e.message}`);
                return ([undefined, undefined]);
            }
        }
        // Fall-through !ref/recoveredNearest
        try {
            const coord = OpenLocationCode.decode(code);
            return ([coord.latitudeCenter, coord.longitudeCenter]);
        } catch (e) {
            console.error(`${e.name}: ${e.message}`);
            return ([undefined, undefined]);
        }
    };

    const PlusCodes = {
        encode: encode,
        decode: decode,
    };
    return PlusCodes;
})();

export { OpenLocationCode, PlusCode, PlusCode as default };

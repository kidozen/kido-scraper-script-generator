"use strict";

module.exports = (function() {

    var Util = {};

    Util.hasOwnValue = function(val) {
        if (typeof this !== "object") throw "Must be called like this: Util.hasOwnValue.call(object, value)";
        for (var prop in this) {
            if (this.hasOwnProperty(prop) && this[prop] === val) {
                return true;
            }
        }
        return false;
    };

    Util.clean = function() {
        if (typeof this !== "string") throw "Must be called like this: Util.clean.call(\"string\")";
        return this.replace(/\r?\n|\r|\s/g, "");
    };

    Util.supplant = function(o) {
        if (typeof this !== "string") throw "Must be called like this: Util.supplant.call(\"string\", { ... })";
        return this.replace(/{{([^{}]*)}}/g,
            function(a, b) {
                var r = o[b];
                if (!r) return "";
                return typeof r === "string" || typeof r === "number" ? r : r.toString();
            }
        );
    };

    Util.quote = function() {
        if (typeof this !== "string") throw "Must be called like this: Util.quote.call(\"string\")";
        var escp_regex = /[\\"]/g,
            escp_callback = "\\$&",
            ctrl_map = {
                "\b": "\\b", // backspace
                "\t": "\\t", // tab
                "\n": "\\n", // new line
                "\f": "\\f", // form feed
                "\r": "\\r" // carriage return
            },
            ctrl_regex = new RegExp("[\b\t\n\f\r]", "g"),
            ctrl_callback = function(match) {
                return ctrl_map[match];
            },
            xhex_regex = /[\x00-\x07\x0B\x0E-\x1F\x7F-\xFF]/g,
            xhex_callback = function(match, char_code) {
                char_code = match.charCodeAt(0);
                return "\\x" + (char_code < 16 ? "0" : "") + char_code;
            },
            uhex_regex = /[\u0100-\uFFFF]/g,
            uhex_callback = function(match, char_code) {
                char_code = match.charCodeAt(0);
                return "\\u" + (char_code < 4096 ? "0" : "") + char_code;
            },
            stringify = typeof JSON !== "undefined" && JSON.stringify;
        var self = this;
        if (self === null) throw new TypeError("can't convert " + self + " to object");
        if (stringify) return stringify(self);
        return "\"" + self
            .replace(escp_regex, escp_callback)
            .replace(ctrl_regex, ctrl_callback)
            .replace(xhex_regex, xhex_callback)
            .replace(uhex_regex, uhex_callback) + "\"";
    };

    return Util;

})();

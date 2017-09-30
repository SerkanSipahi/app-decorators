"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

let elementToFunction = Element => {
    if(typeof Element === 'function'){
        return Element;
    }

    let _Element = function(){};
    _Element.prototype = Element.prototype;
    return _Element;
};

exports.default = elementToFunction;
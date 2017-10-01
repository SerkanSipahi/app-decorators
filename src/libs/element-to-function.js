let elementToFunction = Element => {
    if(typeof Element === 'function'){
        return Element;
    }

    let _Element = function(){};
    _Element.prototype = Element.prototype;
    return _Element;
};

export default elementToFunction;
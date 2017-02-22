let trigger = function(event, params) {

    let customEvent = new CustomEvent(event, { bubbles: true });
    customEvent.params = params;
    this.dispatchEvent(customEvent);
};

let { forEach } = Array.prototype;

export {
    trigger,
    forEach,
};


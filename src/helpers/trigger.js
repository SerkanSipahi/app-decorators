/**
 * trigger
 * @param  {HTMLElement} this
 * @param  {string} eventType
 * @return {undefined}
 */
function trigger(eventType, ...args) {

    let event = new Event(event);
    args.length ? event[eventType] = args : null;
    this.dispatchEvent(event);
}

export {
  trigger,
};
/**
 * Generate unique id
 * @source http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript#105074
 * @returns {string}
 */
function guid() {
    function _s4() {
        return Math.floor(
            (1 + Math.random()) * 0x10000
        ).toString(16).substring(1);
    }
    return _s4() + _s4() + '-' + _s4() + '-' + _s4() + '-' + _s4() + '-' + _s4() + _s4() + _s4();
}

export {
    guid,
};
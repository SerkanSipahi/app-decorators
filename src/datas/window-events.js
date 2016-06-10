
let w = System.global.window;

let windowEvents = {

	'afterprint': w,
	'beforeprint': w,
	'beforeunload': w,
	'hashchange': w,
	'load': w,
	'message': w,
	'pagehide': w,
	'pageshow': w,
	'popstate': w,
	'resize': w,
	'storage': w,
	'unload': w,

	'message': w,
	'mousewheel': w,
	'online': w,
	'offline': w,
	'wheel': w,

	'keydown': w,
	'keypress': w,
	'keyup': w,

};

export {
	windowEvents,
	windowEvents as default
};

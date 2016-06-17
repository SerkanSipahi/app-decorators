
let isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

export {
	isSafari,
	isFirefox,
};

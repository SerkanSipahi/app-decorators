
let isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
let isOpera = (navigator.userAgent.match(/Opera|OPR\//) ? true : false);

export {
	isSafari,
	isFirefox,
	isOpera,
};

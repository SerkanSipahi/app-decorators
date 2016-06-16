
class Event {

	bubbles = false;
	cancelBubble = false;
	cancelable = false;
	composed = false;
	currentTarget = null;
	defaultPrevented = false;
	eventPhase = 0;
	isTrusted = false;
	path = [];
	returnValue = true;
	srcElement = null;
	target = null;
	timeStamp = null;
	type = null;

	preventDefault(){}
	stopPropagation(){}

	constructor(type, config){
		Object.assign(this, config, { type });
		this._init();
	}

	_init(){
		this._setTimestamp();
	}

	_setTimestamp(){
		this.timeStamp = new Date().getTime();
	}
}

export { Event };


class Pubsub {

	constructor(config){
		Object.assign(this, config);
	}

	publish(event, ...args){
		this.scope.trigger(event, ...args);
	}

	subscribe(event, callback){
		this.scope.on(event, callback)
	}

	unsubscribe(event){
		this.scope.off(event);
	}

}

export {
	Pubsub
};

import { Eventhandler} from '../libs/eventhandler';
import { Router } from '../libs/router';
import { extend } from '../libs/dependencies';
import { routerConfig } from '../configs/route.config.client';

/**
 * create
 * @param  {Object} config
 * @return {Router} router
 */
Router.create = function(config = {}){

	let _routerConfig = Router.makeConfig(config);
	return new Router(_routerConfig);
};

/**
 * makeConfig
 * @param config
 * @return {object} _routerConfig
 */
Router.makeConfig = function(config = {}){

	let _routerConfig = extend(
		true, {},
		routerConfig,
		config
	);

	_routerConfig.scope = new Eventhandler({
		element: _routerConfig.scope,
	});
	_routerConfig.globalScope = new Eventhandler({
		element: _routerConfig.globalScope,
	});

	return _routerConfig;
};

export {
	Router
};

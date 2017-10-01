// Bootstrap
import './bootstrap';
import elementToFunction from './libs/element-to-function'

// Libraries
export { Register } from './libs/customelement';
export { Eventhandler } from './libs/eventhandler';
export { View } from './libs/view';
export { Stylesheet } from './libs/stylesheet';
export { Router } from './apps/router';
export { Pubsub } from './apps/pubsub';
export { storage } from './libs/random-storage';
export default elementToFunction;

// Decorators
export { component } from './decorators/component';
export { view } from './decorators/view';
export { style } from './decorators/style';
export { on } from './decorators/on';
export { action } from './decorators/action';
export { model } from './decorators/model';
export { modelpool } from './decorators/modelpool';
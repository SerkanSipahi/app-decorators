import { corejs } from './libs/dependencies';
import { Webcomponents } from './libs/dependencies';

/**
 * Assign polyfills or fix browser bugs
 */

/**
 * Assign not supported Object (ES6/ES7) methods
 */
!Object.assign  ? Object.assign  = corejs.Object.assign  : null;
!Object.classof ? Object.classof = corejs.Object.classof : null;
!Object.entries ? Object.entries = corejs.Object.entries : null;
!Object.values  ? Object.values  = corejs.Object.values  : null;
!Object.getOwnPropertyDescriptors ? Object.getOwnPropertyDescriptors = corejs.Object.getOwnPropertyDescriptors : null;

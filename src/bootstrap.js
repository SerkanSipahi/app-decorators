
/**
 * Load polyfills
 */

// Load and assign needed polyfills for Object
import { corejs } from './libs/dependencies';
!Object.assign  ? Object.assign  = corejs.Object.assign  : null;
!Object.classof ? Object.classof = corejs.Object.classof : null;
!Object.entries ? Object.entries = corejs.Object.entries : null;
!Object.getOwnPropertyDescriptors ? Object.getOwnPropertyDescriptors = corejs.Object.getOwnPropertyDescriptors : null;

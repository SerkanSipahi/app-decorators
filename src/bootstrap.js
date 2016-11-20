import './libs/dependencies';
import {
    assign,
    classof,
    values,
    Map,
    WeakMap,
} from './libs/dependencies';

/**
 * Assign not supported Object (ES6/ES7) methods
 */
!Object.assign  ? Object.assign  = assign  : null;
!Object.classof ? Object.classof = classof : null;
!Object.values  ? Object.values  = values  : null;
!window.Map     ? window.Map     = Map     : null;
!window.WeakMap ? window.WeakMap = WeakMap : null;

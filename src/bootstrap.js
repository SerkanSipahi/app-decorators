import './libs/dependencies';
import {
    assign,
    classof,
    values,
    Map,
    WeakMap,
} from './libs/dependencies';

/**
 * Assign not supported ES6/ES7 API´s (ES6/ES7)
 */
!Object.assign  ? Object.assign  = assign  : null;
!Object.classof ? Object.classof = classof : null;
!Object.values  ? Object.values  = values  : null;
!window.Map     ? window.Map     = Map     : null;
!window.WeakMap ? window.WeakMap = WeakMap : null;

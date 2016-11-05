import { Webcomponents } from './libs/dependencies';

import {
    assign,
    classof,
    entries,
    values,
    getOwnPropertyDescriptors
} from './libs/dependencies';

/**
 * Assign not supported Object (ES6/ES7) methods
 */
!Object.assign  ? Object.assign  = assign  : null;
!Object.classof ? Object.classof = classof : null;
!Object.entries ? Object.entries = entries : null;
!Object.values  ? Object.values  = values  : null;
!Object.getOwnPropertyDescriptors ? Object.getOwnPropertyDescriptors = getOwnPropertyDescriptors : null;

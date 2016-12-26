import { delay } from './delay';

history.backAndWait = ms => {
    history.back();
    return delay(ms);
};

history.forwardAndWait = ms => {
    history.forward();
    return delay(ms);
};

import { polyfills } from './datas/polyfills';
import { lazyPolyfillLoader} from './helpers/lazyPolyfillLoader';


let bootstrapPolyfills = lazyPolyfillLoader(System, polyfills);

export {
    bootstrapPolyfills
}


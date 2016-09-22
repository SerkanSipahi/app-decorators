
// internal libs
import { action } from 'src/app-decorators';

describe('@action decorator', () => {

    describe('action.helper.registerNamespaces', () => {

        it('should create namespaces object for @action decorator', () => {

            action.helper.registerNamespaces({}).should.be.containEql({

                $: { config: { action: {
                        component: {
                            created : [],
                            attached: [],
                            detached: [],
                        },
                }}},
            });
        });

    });

});

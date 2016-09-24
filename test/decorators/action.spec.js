
// internal libs
import { action } from 'src/app-decorators';

describe('@action decorator', () => {

    describe('action.helper.registerNamespaces', () => {

        it('should create namespaces object for @action decorator', () => {

            action.helper.registerNamespaces({}).should.be.containEql({

                $: { config: { action: {
                        events: {},
                        component: {
                            created : [],
                            attached: [],
                            detached: [],
                        },
                }}},
            });
        });

    });

    describe('view.helper', () => {

        let target = null;
        let mockFunction1, mockFunction2, mockFunction3;

        mockFunction1 = function(){};
        mockFunction2 = function(){};
        mockFunction3 = function(){};

        beforeEach(() => {

            target = Object.create({});
            action.helper.registerNamespaces(target);

        });

        describe('registerEvent', () => {

            it('should build config for local event', () => {

                action.helper.registerEvent(target, 'route1 /a.html', mockFunction1).should.have.propertyByPath(
                    '$', 'config', 'action', 'events', 'route1 /a.html'
                ).equal(mockFunction1);

                action.helper.registerEvent(target, 'route2 /b.html', mockFunction2).should.have.propertyByPath(
                    '$', 'config', 'action', 'events', 'route2 /b.html'
                ).equal(mockFunction2);

            });

        });

        describe('registerCallback method', () => {

            it('should add register callback based', () => {

                action.helper.registerCallback('created', target, mockFunction1).should.have.propertyByPath(
                    '$', 'config', 'action', 'component', 'created', '0'
                ).equal(mockFunction1);

            });

            it('should add register callback based', () => {

                action.helper.registerCallback('attached', target, mockFunction2).should.have.propertyByPath(
                    '$', 'config', 'action', 'component', 'attached', '0'
                ).equal(mockFunction2);

            });

            it('should add register callback based', () => {

                action.helper.registerCallback('detached', target, mockFunction3).should.have.propertyByPath(
                    '$', 'config', 'action', 'component', 'detached', '0'
                ).equal(mockFunction3);

            });

        });

    });

});

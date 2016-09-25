
// internal libs
import { action, component, Router } from 'src/app-decorators';

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

    it('should add router instance to domNode.$router', () => {

        @component()
        class Page1 {
            @action('/some/path.html') actionName() {

            }
        }

        let page = Page1.create();
        page.$router.should.be.instanceof(Router);

    });

    it('should bind Component Page instance to action decorator methods', () => {

        @component()
        class Page2 {
            @action('/some/path1.html') actionName() {
                this.method();
                return this;
            }
            method(){
                return this;
            }
        }
        let page = Page2.create();

        let actionName = page.actionName();
        should(actionName).be.instanceof(Page2);
        should(actionName).be.instanceof(Element);

        let method = page.method();
        should(method).be.instanceof(Page2);
        should(method).be.instanceof(Element);

        let page_method_spy     = sinon.spy(page, 'method');
        let page_actionName_spy = sinon.spy(page.$router.scope.getHandlers('actionName')[0], null);

        // by trigger
        page.$router.trigger('actionName');
        page_method_spy.callCount.should.equal(1);
        page_actionName_spy.callCount.should.equal(1);

        // by direct call
        page.actionName();

        page_method_spy.callCount.should.equal(2);

        // cleanup
        page_method_spy.restore();
        page_actionName_spy.restore();

    });

});

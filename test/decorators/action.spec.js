
// internal libs
import { action, component, view, Router } from 'src/app-decorators';
import $ from 'jquery';

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

    describe('@action decorator', () => {

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

        describe('dom test', () => {

            let fixtureElement = null;

            beforeEach(() => {

                fixtureElement = document.createElement('div');
                fixtureElement.id = 'test-page-container';
                document.body.appendChild(fixtureElement);

            });
            afterEach(() => $('#test-page-container').remove());

            @component()
            @view(`
                <a class="path-1" href="/some/path1.html">Path 1</a>
                <a class="path-2" href="/some/path2/2334.html?a=b&c=d#jumpTo=223">Path 2</a>
                <a class="path-3" href="/not/registerd.html">Path 3</a>
            `)
            class Page3 {
                @action('/some/path1.html') actionName1(){

                }
                @action('/some/path2/{{id}}.html') actionName2({ params, search, hash }){
                    let { id } = params;
                }
            }

            it('should call action handler pass right args after clicking registered link', (done) => {

                let page = Page3.create();
                fixtureElement.appendChild(page);

                let page_actionName1_spy = sinon.spy(page.$router.scope.getHandlers('actionName1')[0], null);
                let page_actionName2_spy = sinon.spy(page.$router.scope.getHandlers('actionName2')[0], null);

                setTimeout(() => $(page).find('.path-1').get(0).click(),  0);
                setTimeout(() => $(page).find('.path-2').get(0).click(), 20);
                setTimeout(() => $(page).find('.path-1').get(0).click(), 40);
                setTimeout(() => $(page).find('.path-2').get(0).click(), 60);
                setTimeout(() => $(page).find('.path-3').get(0).click(), 80);

                setTimeout(() => {

                    // call counts
                    page_actionName1_spy.callCount.should.equal(2);
                    page_actionName2_spy.callCount.should.equal(2);

                    // records (passed args to handler)
                    let record1 = page_actionName1_spy.args[0][0];
                    should(record1).be.instanceof(CustomEvent);
                    record1.type.should.be.equal('actionName1');
                    record1.detail.name.should.be.equal('actionName1');
                    record1.detail.urlpart.should.be.equal('pathname');

                    let record2 = page_actionName2_spy.args[1][0];
                    should(record2).be.instanceof(CustomEvent);
                    record2.type.should.be.equal('actionName2');
                    record2.detail.name.should.be.equal('actionName2');
                    record2.detail.urlpart.should.be.equal('pathname');
                    record2.detail.params.id.should.be.equal(2334);

                    // cleanup
                    page_actionName1_spy.restore();
                    page_actionName2_spy.restore();

                    done();
                }, 100);

            });

            it('should call destroy method of router if component element detached', (done) => {

                let page = Page3.create();
                fixtureElement.appendChild(page);

                let $router_destroy_spy = sinon.spy(page.$router, 'destroy');
                let page_actionName1_spy = sinon.spy(page.$router.scope.getHandlers('actionName1')[0], null);

                $(fixtureElement).find('com-page3').remove();
                $(fixtureElement).append(page);
                $(fixtureElement).find('com-page3').remove();

                setTimeout(() => page.$router.trigger('actionName1'), 20);
                setTimeout(() => {

                    $router_destroy_spy.callCount.should.equal(2);
                    page_actionName1_spy.callCount.should.equal(0);

                    $router_destroy_spy.restore();
                    page_actionName1_spy.restore();

                    done();

                }, 30);

            });

            it('should re-init action router on attached if its detached before', (done) => {

                // prepare test data

                let page = Page3.create();
                fixtureElement.appendChild(page);

                let $router_destroy_spy = sinon.spy(page.$router, 'destroy');
                let $router_init_spy = sinon.spy(page.$router, 'init');
                let page_actionName1_spy = sinon.spy(page.$router.scope.getHandlers('actionName1')[0], null);

                // start tests

                setTimeout(() => page.$router.trigger('actionName1'),  0);
                setTimeout(() => $(fixtureElement).find('com-page3').remove(),  10);
                setTimeout(() => page.$router.trigger('actionName1'),  20);

                setTimeout(() => {

                    $router_destroy_spy.callCount.should.equal(1);
                    $router_init_spy.callCount.should.equal(0);
                    page_actionName1_spy.callCount.should.equal(1);

                    page_actionName1_spy.restore();

                }, 30);

                setTimeout(() => $(fixtureElement).append(page),  40);

                let page_actionName1_spy_b = null;

                setTimeout(() => page_actionName1_spy_b = sinon.spy(page.$router.scope.getHandlers('actionName1')[0], null),  50);
                setTimeout(() => $(page).find('.path-1').get(0).click(), 60);

                setTimeout(() => {

                    $router_destroy_spy.callCount.should.equal(1);
                    $router_init_spy.callCount.should.equal(1);
                    page_actionName1_spy_b.callCount.should.equal(1);

                    $router_destroy_spy.restore();
                    $router_init_spy.restore();
                    page_actionName1_spy_b.restore();

                    done();

                }, 70);

            });

        });

    });

});

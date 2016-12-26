import { bootstrapPolyfills } from 'src/bootstrap';
import { storage } from "src/libs/random-storage";
import { delay } from 'src/helpers/delay';

import $ from 'jquery';
import 'src/helpers/jquery.click-and-wait';
import 'src/helpers/history.back-forward-and-wait';

import sinon from 'sinon';

describe('@action decorator', async() => {

    await bootstrapPolyfills;
    let { action, component, view, Router } = await System.import('app-decorators');

    describe('@action decorator', () => {

        it('should call customElements hooks in right order', done => {

            (async () => {

            @component({
                name: 'right-order-action',
                scoped: true,
            })
            class RightOrderAction {
                @action('/some/path.html') onPath(){
                }
            }

            /**
             *  Setup
             */

            $('body').append('<div class="test-right-order"></div>');

            let createdCallback  = storage.get(RightOrderAction).get('@callbacks').get('created');
            let attachedCallback = storage.get(RightOrderAction).get('@callbacks').get('attached');
            let detachedCallback = storage.get(RightOrderAction).get('@callbacks').get('detached');

            let spy_rightOrder_created  = sinon.spy(createdCallback,  0);
            let spy_rightOrder_attached = sinon.spy(attachedCallback, 0);
            let spy_rightOrder_detached = sinon.spy(detachedCallback, 0);

            let rightOrderCom = RightOrderAction.create();
            $('.test-right-order').append(rightOrderCom);
            $('.test-right-order right-order-action').remove();
            $('.test-right-order').append(rightOrderCom);

            await delay(1);

            /**
             *  Test
             */

            spy_rightOrder_created.callCount.should.be.equal(1);
            spy_rightOrder_attached.callCount.should.be.equal(2);
            spy_rightOrder_detached.callCount.should.be.equal(1);

            // cleanup
            createdCallback[0].restore();
            attachedCallback[0].restore();
            detachedCallback[0].restore();
            $('.test-right-order').remove();

            done();

            })();

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

        describe('dom test', () => {

            let fixtureElement = null;

            beforeEach(() => {

                fixtureElement = document.createElement('div');
                fixtureElement.id = 'test-page-container';
                document.body.appendChild(fixtureElement);

            });
            afterEach(() => $('#test-page-container').remove());

            @view(`
                <a class="path-1" href="/some/path1.html">Path 1</a>
                <a class="path-2" href="/some/path2/2334.html?a=b&c=d#jumpTo=223">Path 2</a>
                <a class="path-3" href="/not/registerd.html">Path 3</a>
            `)
            @component()
            class Page3 {
                @action('/some/path1.html') actionName1(){

                }
                @action('/some/path2/{{id}}.html') actionName2({ params, search, hash }){
                    let { id } = params;
                }
            }

            it('should reinit router after removing and appending', done => {

                (async () => {

                let page = Page3.create();
                fixtureElement.appendChild(page);

                let page_actionName1_spy = sinon.spy(page.$router.scope.getHandlers('actionName1')[0], null);
                let page_actionName2_spy = sinon.spy(page.$router.scope.getHandlers('actionName2')[0], null);

                await $('.path-1', page).clickAndWait(10);
                await $('.path-2', page).clickAndWait(10);
                await $('.path-1', page).clickAndWait(10);
                await $('.path-2', page).clickAndWait(10);
                await $('.path-3', page).clickAndWait(10);

                // call counts
                page_actionName1_spy.callCount.should.equal(2);
                page_actionName2_spy.callCount.should.equal(2);

                // cleanup
                $('#test-page-container com-page3').remove();
                $('a', page).on('click', e => e.preventDefault());

                await delay(10);

                await $('.path-1', page).clickAndWait(10);
                await $('.path-2', page).clickAndWait(10);
                await $('.path-3', page).clickAndWait(10);

                // call counts
                page_actionName1_spy.callCount.should.equal(2);
                page_actionName2_spy.callCount.should.equal(2);

                page_actionName1_spy.restore();
                page_actionName2_spy.restore();
                $('a', page).off('click', e => e.preventDefault());

                $('#test-page-container').append(page);
                await delay(10);

                let page_actionName1_1_spy = sinon.spy(page.$router.scope.getHandlers('actionName1')[0], null);
                let page_actionName2_1_spy = sinon.spy(page.$router.scope.getHandlers('actionName2')[0], null);

                await $('.path-1', page).clickAndWait(10);
                await $('.path-2', page).clickAndWait(10);
                await $('.path-3', page).clickAndWait(10);

                // call counts
                page_actionName1_1_spy.callCount.should.equal(1);
                page_actionName2_1_spy.callCount.should.equal(1);

                // cleanup
                page_actionName1_1_spy.restore();
                page_actionName2_1_spy.restore();

                done();

                })();

            });


            it('should pass correct args after clicking route', done => {

                (async () => {

                let page = Page3.create();
                fixtureElement.appendChild(page);

                let page_actionName1_spy = sinon.spy(page.$router.scope.getHandlers('actionName1')[0], null);
                let page_actionName2_spy = sinon.spy(page.$router.scope.getHandlers('actionName2')[0], null);

                await $('.path-1', page).clickAndWait(10);
                await $('.path-2', page).clickAndWait(10);
                await $('.path-3', page).clickAndWait(10);

                // call counts
                page_actionName1_spy.callCount.should.equal(1);
                page_actionName2_spy.callCount.should.equal(1);

                // records (passed args to handler)
                let record1 = page_actionName1_spy.args[0][0];

                should(record1).be.instanceof(CustomEvent);
                record1.type.should.be.equal('actionName1');
                record1.detail.name.should.be.equal('actionName1');
                record1.detail.urlpart.should.be.equal('pathname');

                let record2 = page_actionName2_spy.args[0][0];
                should(record2).be.instanceof(CustomEvent);
                record2.type.should.be.equal('actionName2');
                record2.detail.name.should.be.equal('actionName2');
                record2.detail.urlpart.should.be.equal('pathname');
                record2.detail.params.id.should.be.equal(2334);

                // cleanup
                page_actionName1_spy.restore();
                page_actionName2_spy.restore();

                done();

                })();

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

            it('should call correct methods if router detached and attached', done => {

                // prepare test data

                let page = Page3.create();
                fixtureElement.appendChild(page);

                let $router_destroy_spy = sinon.spy(page.$router, 'destroy');
                let $router_init_spy = sinon.spy(page.$router, 'init');
                let page_actionName1_spy = sinon.spy(page.$router.scope.getHandlers('actionName1')[0], null);

                // start tests

                setTimeout(() => $(fixtureElement).find('com-page3').remove(),  10);
                setTimeout(() => page.$router.trigger('actionName1'),  20);

                setTimeout(() => {

                    $router_destroy_spy.callCount.should.equal(1);
                    $router_init_spy.callCount.should.equal(0);
                    page_actionName1_spy.callCount.should.equal(0);

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

            it('should differ between different route instance on history back/forward', done => {

                (async () => {

                let page1 = Page3.create();
                let page_actionName1_spy = sinon.spy(page1.$router.scope.getHandlers('actionName1')[0], null);
                fixtureElement.appendChild(page1);

                let page2 = Page3.create();
                let page_actionName2_spy = sinon.spy(page2.$router.scope.getHandlers('actionName1')[0], null);
                fixtureElement.appendChild(page2);

                // Page1
                await $('.path-1', page1).clickAndWait(50);
                await $('.path-3', page1).clickAndWait(50);
                await $('.path-1', page1).clickAndWait(50);
                await $('.path-3', page1).clickAndWait(50);

                await history.backAndWait(50);
                await history.backAndWait(50);
                await history.backAndWait(50);

                page_actionName1_spy.callCount.should.be.aboveOrEqual(3);
                page_actionName2_spy.callCount.should.equal(0);

                // Page2
                await $('.path-1', page2).clickAndWait(50);
                await $('.path-3', page2).clickAndWait(50);
                await $('.path-1', page2).clickAndWait(50);
                await $('.path-3', page2).clickAndWait(50);

                await history.backAndWait(50);
                await history.backAndWait(50);
                await history.backAndWait(50);

                page_actionName1_spy.callCount.should.be.aboveOrEqual(3);
                page_actionName2_spy.callCount.should.be.aboveOrEqual(3);

                //console.log('route different instance: ', page_actionName1_spy.callCount);
                //console.log('route different instance: ', page_actionName2_spy.callCount);

                // cleanup
                page_actionName1_spy.restore();
                page_actionName2_spy.restore();

                done();

                })();

            });

        });

    });

});

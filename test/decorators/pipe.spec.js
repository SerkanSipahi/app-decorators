
// internal libs
import { component, view, on } from 'src/app-decorators';

describe.skip('@pipe decorator', () => {

	// 1.) alle componenten inhalte instance(domNode) als blob speichern um sie beim nächsten mal als local file zu laden.
	// Idee: alle componenten können miteinander kommunizieren, wenn sie
	// mit x-foo oder mit irgendeinem html tag z.B. <div is="x-foo"></div>
	// erstellt wurden sind.
	//
	// 2.) Man verringert den komplexität wert

	it('...', () => {

		@error({ level: 3 })
		@datapool('information')

		@style(`
			x-stream {

				$deltaX: @on('wheel').currentTarget.deltaX;
				$deltaY: @on('wheel').currentTarget.deltaY;

				top: $deltaX;
				left: $deltaY;
				position: 'absolute';

				content: "{{ <links.key }}"
			}
		`)

		/**
		 * Highlighting für diese syntax für die Lesbarkeit von Code
		 */
		@view(`
			<button is="x-button" @('click')="onClickButton()">Click Me!</button>
			<box is="x-box">
				<input is="x-input" @on('change').value="{{ >firstname }}" name="firstname" value="{{ <firstname }}" type="text" />
				<input is="x-input" @on('change').value="{{ >surename }}" name="surename" value="{{ <surename }}"type="text" />
				<a is="x-a" @request.post="?stream&firstname={{ <name }}&lastname{{ <nachname }}" @route.name="onPost"></a>
			</box>
			<x-links while="{{ <links key value }}">
				<a is="x-a" @request.post="/{{ <value.firstname }}/{{ <value.lastname }}"> {{ <key }} </a>
			</x-links>
		`)

		@component({
			name: 'x-stream'
		})

		class Stream {

			created(){

				this.model.vorname = 'Serkan';
				this.model.nachname = 'Sipahi';
			}

			attached(){

				this.trigger('startCircleAnimation');
			}

			@on('wheel') @debounce(100) onWheel(event){

				console.log(event.deltaX, event.deltaY);
			}

			/**
			 * Model settings
			 */
			@model.attr vorname = '';
			@model.attr nachname = '';

			@model.attr links = [];

			@model('change:vorname') onChangeVorname(oldValue, newValue){

				this.view.vorname = newValue;
			}
			@model('change:nachname') onChangeNachname(oldValue, newValue){

				this.view.nachname = newValue;
			}

			@on('get-links')
			@$if @cond(this.request.url)
				@request(this.request.url)
			@$else
				@request('http://bing.com')
			@extractFromString(/<a href="(.*)"<\/>/gm)

			onExtractedHTML(links, error) {

				if(error){
					throw this.Error('Es ist ein Fehler aufgereten!');
				}

				this.model.links.push(links);

				console.log(this.informationen.model.title);
			}

			@model('change:links') onChangeLinks(oldValue, newValue) {

				this.view.links = newValue;
			}

			/**
			 * on
			 * @param  {string} 'x-button'
			 * @return {undefined}
			 */

			@view.bind id = 0;

			@on('startCircleAnimation')

			@pipe(animationConfig('ease-in-out'))
			@pipe(moveup('100px', '1s'), 'async')
			@pipe(moveleft('200px', '500ms'), 'async')
			@pipe(movedown('200px', '800ms'), 'sync')
			@pipe(moveright('200px', '1s'), 'sync')

			animation_MoveCircleInBox(result, error){

				if(error){
					throw this.Error('Es ist ein Fehler aufgereten!');
				}

				console.log('animation done!');
			}

			onClickButton(event){

				this.querySelector('a[is="x-a"]').click();
			}

			@on('get', '?stream&firstname={{name}}&lastname{{nachname}}') onPost({name, nachname}){

				this.model.vorname = name;
				this.model.nachname = nachname;
			}

		}
	});
});

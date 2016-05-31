
// internal libs
import { component, view, on } from 'src/app-decorators';

describe.skip('@pipe decorator', () => {

	// 1.) alle componenten inhalte instance(domNode) als blob speichern um sie beim nächsten mal als local file zu laden.
	// Idee: alle componenten können miteinander kommunizieren, wenn sie
	// mit x-foo oder mit irgendeinem html tag z.B. <div is="x-foo"></div>
	// erstellt wurden sind.

	it('...', () => {

		@style(`
			x-stream {
				top : 0;
				left : 0;
				position : 'absolute';
			}
		`)
		@view(`
			<x-button @('click')="onClickButton()">Click Me!</x-button>
			<x-box>
				<input is="x-input" @on('change').value="{{ firstname > }}" name="firstname" value="{{ firstname < }}" type="text" />
				<input is="x-input" @on('change').value="{{ surename > }}" name="surename" value="{{ surename < }}"type="text" />
				<a is="x-a" href="?stream&firstname={{ name < }}&lastname{{ nachname < }}" @route.name="onPost"></a>
			</x-box>
		`)
		@component()
		class Stream {

			relatedTo = ''

			created(){

				this.model.vorname = 'Serkan';
				this.model.nachname = 'Sipahi';

				this.trigger('startCircleAnimation');

			}

			/**
			 * Model settings
			 */
			@model.attr vorname = '';
			@model.attr nachname = '';

			@model('change:vorname') onChangeVorname(oldValue, newValue){
				this.view.vorname = newValue;
			}
			@model('change:nachname') onChangeNachname(oldValue, newValue){
				this.view.nachname = newValue;
			}

			/**
			 * on
			 * @param  {string} 'x-button'
			 * @return {undefined}
			 */

			@view.bind('') id = 0;

			@on('startCircleAnimation')

			@pipe(animationConfig('ease-in-out'))
			@pipe(moveup('100px', '1s'), 'async')
			@pipe(moveleft('200px', '500ms'), 'async')
			@pipe(movedown('200px', '800ms'), 'sync')
			@pipe(moveright('200px', '1s'), 'sync')

			animation_MoveCircleInBox(result, error){

				if(error){
					throw Stream.Error('Es ist ein Fehler aufgereten!');
				}

				this.view.id++;

			}

			onClickButton(event){

				this.querySelector('a[is="x-a"]').click();

			}

			@on('post', '?stream&firstname={{name}}&lastname{{nachname}}') onPost({name, nachname}){

				this.model.vorname = name;
				this.model.nachname = nachname;
			}

		}

	});

});

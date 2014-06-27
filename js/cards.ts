module Cards {
	export class CardCollection {
		private members: Array<number>;

		constructor() {
			this.members = new Array<number>();
		}

		push(value: number) {
			this.members.push(value);
		}

		pop() {
			return this.members.pop();
		}

		sum() {
			return this.members.reduce(
				function (i, j) {
					return i + j;
				}, 0
			);
		}

		count () {
			return this.members.length;
		}
	}

	export class Hand extends CardCollection {
		private hasAce: boolean;

		constructor() {
			this.hasAce = false;
			super();
		}

		push(value: number) {
			if (value === 1) {
				this.hasAce = true;
			}
			super.push(value);
		}

		sum() {
			var nonAce = super.sum();
			return nonAce + (this.hasAce && nonAce <= 10 ? 10 : 0);
		}

	}


	export interface CardValue {
		card:number;
		value:number;
		type:string;
	}

	export class AbstractDeck {
		types = ['clubs', 'diamonds', 'hearts', 'spades'];
		cards: CardValue[];
		currentIndex:number;


		constructor() {
			this.cards = [];
			this.currentIndex = 0;
		}

		shuffle():void {
			for(var j, x, i = this.cards.length; i; j = Math.floor(Math.random() * i)){
				x = this.cards[--i];
				this.cards[i] = this.cards[j];
				this.cards[j] = x;
			}
		}

		getCurrent() {
			throw new Error("This method is abstract.");
		}

	}

	export class RealisticDeck extends AbstractDeck {

		constructor() {
			super();

			for (var i = 0; i < this.types.length; i++) {
				for (var j = 1; j <= 13; j++) {
					var value = (j > 10) ? 10 : j;
					this.cards.push({
						card: j,
						value: value,
						type: this.types[i]
					});
				};
			}

			this.shuffle();
		}

		getCurrent() {
			return this.cards[this.currentIndex];
		}

		dealNew() {
			return this.cards[++this.currentIndex];
		}
	}

	export class Card {
		public container:JQuery;

		constructor(private id, private type, public value, private side) {
			if (side === 'back') {
				this.container = $('<div data-id="'+id+'" class="card back"></div>');
			} else {
				var cardValue =
					( value == 1 ) ? 'A' :
					( value == 11 ) ? 'J' :
					( value == 12 ) ? 'Q' :
					( value == 13 ) ? 'K' :
					value,
				cardIcon  =
					( type == 'hearts' ) ? '♥' :
					( type == 'diamonds' ) ? '♦' :
					( type == 'spades' ) ? '♠' :
					'♣',
				corner = '<div><span>'+cardValue+'</span><span>'+cardIcon+'</span></div>',
				icons = '';

				if ( value <= 10 ) {
					for ( var i=1, l=value; i <= l; i++ ) {
						icons += '<span>'+cardIcon+'</span>';
					}
				} else {
					icons =
						( value == 11 ) ? '<span>♝</span>' :
						( value == 12 ) ? '<span>♛</span>' :
						( value == 13 ) ? '<span>♚</span>' : '';
				}
				this.container =
					$('<div data-id="'+id+'" class="card value'+cardValue+
					  ' '+type+'">'+corner+'<div class="icons">'+icons+
					  '</div>'+corner+'</div>');
			}
		}

		setCss(toSet) {
			this.container.css(toSet)
		}

		getFlipped() {
			var newSide = '';
			if (this.side === 'back') {
				newSide = 'front';
			} else if(this.side === 'front') {
				newSide = 'back';
			} else {
				throw new Error("No such card side");
			}

			return new Card(this.id, this.type, this.value, newSide);
		}

		index() {
			return this.container.index();
		}
	}
}
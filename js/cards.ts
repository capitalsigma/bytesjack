/// <reference path='../libs/jquery.d.ts'/>

module Cards {
	class SummableArray {
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

		top () {
			return this.members[this.members.length - 1];
		}
	}

	export class Hand  {
		private hasAce: boolean;
		private cards:Array<Card>;
		private values:SummableArray;

		constructor() {
			this.hasAce = false;
			this.values = new SummableArray();
			this.cards = new Array<Card>();
		}

		push(card:Card) {
			if (card.value === 1) {
				this.hasAce = true;
			}
			this.values.push(card.value > 10 ? 10 : card.value);
			this.cards.push(card);
		}

		sum() {
			var nonAce = this.values.sum();
			return nonAce + (this.hasAce && nonAce <= 11 ? 10 : 0);
		}

		lastCard() {
			return this.cards[this.cards.length - 1];
		}

		// toStrings() : Array<String> {
		// 	return this.cards.map((x:Card) => x.prettify());
		// }

	}


	export interface CardValue {
		card:number;
		value:number;
		type:string;
	}

	export class AbstractCardCollection {
		types = ['clubs', 'diamonds', 'hearts', 'spades'];
		cards: CardValue[];
		currentIndex:number;

		constructor() { }

		getCardAtIndex(index:number):CardValue {
			throw new Error("This method is abstract.");
		}

		getCardWithValue(value):CardValue {
			throw new Error("This method is abstract.");
		}

		clampAtTen(value) {
			return value > 10 ? 10 : value;
		}

	}

	export class RealisticCardCollection extends AbstractCardCollection {

		constructor() {
			super();
			this.cards = [];
			this.currentIndex = -1;

			for (var i = 0; i < this.types.length; i++) {
				for (var j = 1; j <= 13; j++) {
					var value = this.clampAtTen(j);
					this.cards.push({
						card: j,
						value: value,
						type: this.types[i]
					});
				};
			}

			this.shuffle();
		}


		private shuffle():void {
			for(var j, x, i = this.cards.length; i; j = Math.floor(Math.random() * i)){
				x = this.cards[--i];
				this.cards[i] = this.cards[j];
				this.cards[j] = x;
			}
		}

		getCardAtIndex(index) {
			return this.cards[index]
		}

		getCardWithValue(value) {
			for(var i = 0; i < this.cards.length; i++) {
				if(this.cards[i].value === value) {
					var ret = this.cards[i];
					// this.cards = this.cards.splice(i, 1);
					return ret;
				}
			}
			throw new Error("Should never see this");
		}
	}

	export class RandomCardCollection extends AbstractCardCollection {
		cardsDealt: {[index: number]: CardValue}

		constructor() {
			super();
		}

		private generateRandom() {
			return this.generateRandomFromCard(
				Math.floor(Math.random() * (12)) + 1);
		}

		private generateRandomFromCard(card) {
			var value = this.clampAtTen(card),
			type = this.types[Math.floor(Math.random() * 3)];

			return {
				card: card,
				value: value,
				type: type
			};
		}

		getCardAtIndex(index) {
			if (index in this.cardsDealt) {
				return this.cardsDealt[index];
			} else {
				var newCard = this.generateRandom()
				this.cardsDealt[index] = newCard;
				return newCard;
			}
		}

		getCardWithValue(value) {
			return this.generateRandomFromCard(value);
		}
	}

	export class AbstractDeck {
		cards:AbstractCardCollection;
		currentIndex = 0;

		constructor () {
			// this.cards = cardCollection;
			// throw new Error("This method is abstract.");
		}

		getCurrent() {
			throw new Error("This method is abstract.");
		}

		dealNew() {
			throw new Error("This method is abstract.");
		}
	}

	export class RealisticDeck extends AbstractDeck {

		constructor() {
			super();
			this.cards = new RealisticCardCollection();
		}


		getCurrent() {
			return this.cards[this.currentIndex];
		}

		dealNew() {
			return this.cards[++this.currentIndex];
		}
	}

	export class RandomRiggedDeck extends AbstractDeck {
		private currentCard:CardValue = null;

		constructor(private riggedMap) {
			super();
			this.cards = new RandomCardCollection();
		}

		private setRigged(index) {
			if (index in this.riggedMap) {
				this.currentCard = this.cards.getCardWithValue(this.riggedMap[index]);
			} else {
				this.currentCard = this.cards.getCardAtIndex(index);
			}
		}

		getCurrent() {
			return this.currentCard;
		}

		dealNew() {
			this.setRigged(++this.currentIndex);

			return this.currentCard;
		}
	}

	export class Card {
		public container:JQuery;
		static currentId = 0;

		constructor(public type, public value, private side, public id?) {
			if (this.id === undefined) {
				this.id = Card.currentId++;
			}

			if (side === 'back') {
				this.container = $('<div data-id="'+ this.id +'" class="card back"></div>');
			} else {
				var cardValue = this.valueToString(),
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
					$('<div data-id="'+ this.id  +'" class="card value'+cardValue+
					  ' '+type+'">'+corner+'<div class="icons">'+icons+
					  '</div>'+corner+'</div>');
			}
		}

		valueToString () {
			return (( this.value == 1 ) ? 'A' :
					( this.value == 11 ) ? 'J' :
					( this.value == 12 ) ? 'Q' :
					( this.value == 13 ) ? 'K' :
					String(this.value));
		}

		prettify() {
			return {
				"Suit": this.type,
				"Rank": this.valueToString()
			}
		}

		toString(): string {
			var s = '';
			var pret = this.prettify();

			for (var prop in pret) {
				s += prop + " : " + pret[prop];
			}
			return s;
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

			return new Card(this.type, this.value, newSide, this.id);
		}

		index() {
			return this.container.index();
		}

		toJSON() {				// hack
			this.container = undefined;
			return this;
		}
	}
}
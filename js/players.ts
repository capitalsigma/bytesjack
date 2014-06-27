module Players {

	export class AbstractPlayer {
		private hand:Cards.Hand;
		isDealer:boolean = undefined;
		// private cardsContainer:JQuery;
		// private totalContainer:JQuery;

		// typescript doesn't have protected variables
		constructor(public cardsContainer:JQuery,
					public totalContainer:JQuery,
					public isSafari:boolean){
			this.hand = new Cards.Hand();
		}

		getScore() {
			return this.hand.sum();
		}

		displayScore() {
			this.totalContainer.html(String(this.getScore()));
		}

		resetHand() {
			this.hand = new Cards.Hand();
			this.totalContainer.html('');
			this.cardsContainer.html('');
		}

		updateTotal(newTotal:number) {
			this.totalContainer.html(String(newTotal));
		}

		// addCard(side, callback) {

		addCard(card:Cards.Card, callback, isDealer?){
			// var cardData  = this.cards[this.cardsIndex],
			// container = ( player == 'player' ) ? this.pCardsContainer : this.dCardsContainer,
			// card      = this.buildCard(this.cardsIndex, cardData.type, cardData.card, side),
			var zIndex:number;

			this.hand.push(card.value);
			// this.cardsIndex++;
			// this.canDoAction = false;

			card.setCss({
				'top'   : '-150%',
				'left'  : '100%'
			});

			this.cardsContainer.append(card.container);

			if (isDealer === false) {
				zIndex = card.index();
			} else if (isDealer === true) {
				zIndex = 50 - card.index();
			} else {
				throw new Error("AbstractPlayer should never get cards");
			}
			// zIndex = this.isDealer ? card.index() : 50-card.index();
			card.setCss({'z-index': String(zIndex)});

			setTimeout(() => {
				card.setCss({
					'top'     : '0%',
					'left'    : 10 * card.index() + '%'
				});
				this.rotateCards();


				setTimeout(() => {
					this.centerContainer();
					// if ( player == 'player' ) this.addToPlayerTotal(cardData.value);
					// else                      this.addToDealerTotal(cardData.value);

					// this.canDoAction = true;
					if ( callback != undefined ) callback.call();
				}, G.ANIM_DELAY + 100);
			}, 10);
		}


		centerContainer(){
			var lastCard    = this.cardsContainer.children('.card:last-child'),
			totalWidth  = 0;

			if ( lastCard.length == 0 ) return;

			totalWidth = lastCard.position().left + lastCard.width();
			// if ( this.html.attr('browser') == 'Safari' )
			if (this.isSafari) {
				this.cardsContainer.css('-webkit-transform',
										'translate3d('+ -totalWidth / 2 +'px,0,0)');
			} else {
				this.cardsContainer.css('margin-left', -totalWidth / 2 + 'px');
			}
		}


		rotateCards(isDealer?:boolean){
			if (isDealer === undefined) {
				throw new Error("Not implemented error");
			}

			console.log("Cards rotating");
			var cards = this.cardsContainer.children('.card'),
			numCards  = cards.length - 1,
			increment = ( isDealer ) ? 1 : -1,
			pattern   = ( G.PATTERNS[numCards] ) ?
				G.PATTERNS[numCards] :
				G.PATTERNS[G.PATTERNS.length-1];

			cards.each(function (i) {
				var deg     = ( i < pattern.length ) ?
					pattern[i].deg :
					pattern[pattern.length-1].deg,
				offset  = ( i < pattern.length ) ?
					pattern[i].top :
					pattern[pattern.length-1].top + (20 * (i - pattern.length + 1));

				console.log("rotating by " + String(deg * increment));
				console.log(String(i));
				$(this).css({
					'-webkit-transform' : 'rotate('+ deg * increment +'deg)',
					'-khtml-transform' : 'rotate('+ deg * increment +'deg)',
					'-moz-transform' : 'rotate('+ deg * increment +'deg)',
					'-ms-transform' : 'rotate('+ deg * increment +'deg)',
					'transform' : 'rotate('+ deg * increment +'deg)',
					'top' : offset * -increment + 'px'
				});
			});
		}

	}

	export class Dealer extends AbstractPlayer {
		// isDealer:boolean = true;
		// constructor(cardsContainer:JQuery,
		// 			totalContainer:JQuery,
		// 			isSafari:boolean){
		// 	super(cardsContainer, totalContainer, isSafari);
		// 	this.isDealer = true;
		// }

		doTurn() {

		}

		addCard(card:Cards.Card, callBack) {
			return super.addCard(card, callBack, true);
		}

		rotateCards() {
			super.rotateCards(true);
		}

	}

	export class Player extends AbstractPlayer {
		// isDealer = false;
		betSize = 5;
		doubled = false;

		constructor(public cardsContainer:JQuery,
					public totalContainer:JQuery,
					public isSafari:boolean,
					private bankContainer,
					public bankValue=100) {
			super(cardsContainer, totalContainer, isSafari);
		}

		changeBankroll(betMultiplier) {
			console.log("Changing bankroll by " + String(betMultiplier));
			this.bankValue += betMultiplier * this.betSize;
			this.bankContainer.html(String(this.bankValue));
			console.log("New bankroll: " + String(this.bankValue));
		}


		addCard(card:Cards.Card, callback) {
			super.addCard(card, callback, false);
			this.displayScore();
		}

		rotateCards() {
			super.rotateCards(false);
		}


		changeBet(toValue) {
			this.betSize = toValue;
		}

	}
}
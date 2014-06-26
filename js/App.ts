/*
 *  BytesJack fork
 */

/// <reference path='../libs/jquery.d.ts'/>


// Globals
var ANIM_DELAY = 300;
var PATTERNS = [
        [{deg: 0, top: 0}],
        [{deg: 5, top: 0}, {deg: -5, top: 0}],
        [{deg: 5, top: 15}, {deg: -1, top: 0}, {deg: -5, top: 15}],
        [{deg: 9, top: 20}, {deg: 4, top: 0}, {deg: -4, top: 0},
		 {deg: -9, top: 15}],
        [{deg: 12, top: 50}, {deg: 8, top: 10}, {deg: -4, top: 0},
		 {deg: -12, top: 15}, {deg: -16, top: 40}],
        [{deg: 14, top: 40}, {deg: 8, top: 10}, {deg: -2, top: 5},
		 {deg: -5, top: 15}, {deg: -8, top: 40}, {deg: -14, top: 70}],
        [{deg: 14, top: 70}, {deg: 8, top: 30}, {deg: 4, top: 10},
		 {deg: 0, top: 5}, {deg: -4, top: 20}, {deg: -8, top: 40},
		 {deg: -16, top: 70}]
    ];


/*
 * Array shuffle <http://snipplr.com/view/535>
 * Array sum <http://snipplr.com/view/533>
 *
 */

interface Array<T> {
	// sum(): T;
	shuffle(): Array<T>;
}

interface Window {
	App: App;
}

// class CardArray extends ExtendibleNumberArray {
// 	suffle():CardArray {
// 		for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i)){
// 			x = this[--i];
// 			this[i] = this[j];
// 			this[j] = x;
// 		}
// 		return this;
// 	}

// 	sum():number {
// 		for(var s = 0, i = this.length; i; s += this[--i]){};
// 		return s;
// 	}
// }


class CardCollection {
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
}

class Hand extends CardCollection {
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


interface CardValue {
	card:number;
	value:number;
	type:string;
}

class AbstractDeck {
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

class RealisticDeck extends AbstractDeck {

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

class Card {
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


class AbstractPlayer {
	private hand:Hand;
	isDealer:boolean = undefined;
	// private cardsContainer:JQuery;
	// private totalContainer:JQuery;

	// typescript doesn't have protected variables
	constructor(public cardsContainer:JQuery,
				public totalContainer:JQuery,
				public isSafari:boolean){
		this.hand = new Hand();
	}

	getScore() {
		return this.hand.sum();
	}

	displayScore() {
		this.totalContainer.html(String(this.getScore()));
	}

	resetHand() {
		this.hand = new Hand();
		this.totalContainer.html('');
		this.cardsContainer.html('');
	}

	updateTotal(newTotal:number) {
		this.totalContainer.html(String(newTotal));
	}

	// addCard(side, callback) {

	addCard(card:Card, callback, isDealer?){
		// var cardData  = this.cards[this.cardsIndex],
        // container = ( player == 'player' ) ? this.pCardsContainer : this.dCardsContainer,
        // card      = this.buildCard(this.cardsIndex, cardData.type, cardData.card, side),
		var zIndex    = 0;

		this.hand.push(card.value);
		// this.cardsIndex++;
		// this.canDoAction = false;

		card.setCss({
			'top'   : '-150%',
			'left'  : '100%'
		});

		this.cardsContainer.append(card.container);
		if (isDealer === true) {
			zIndex = card.index();
		} else if (isDealer === false) {
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
			}, ANIM_DELAY + 100);
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


	private rotateCards(){
		var cards = this.cardsContainer.children('.card'),
        numCards  = this.cardsContainer.length - 1,
        increment = ( this.isDealer ) ? 1 : -1,
        pattern   = ( PATTERNS[numCards] ) ?
			PATTERNS[numCards] :
			PATTERNS[PATTERNS.length-1];

		cards.each((i) => {
			var deg     = ( i < pattern.length ) ?
				pattern[i].deg :
				pattern[pattern.length-1].deg,
            offset  = ( i < pattern.length ) ?
				pattern[i].top :
				pattern[pattern.length-1].top + (20 * (i - pattern.length + 1));

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

class Dealer extends AbstractPlayer {
	isDealer:boolean = true;
	// constructor(cardsContainer:JQuery,
	// 			totalContainer:JQuery,
	// 			isSafari:boolean){
	// 	super(cardsContainer, totalContainer, isSafari);
	// 	this.isDealer = true;
	// }

	doTurn() {

	}

	addCard(card:Card, callBack) {
		return super.addCard(card, callBack, true);
	}

}

class Player extends AbstractPlayer {
	isDealer = false;
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


	addCard(card:Card, callback) {
		super.addCard(card, callback, false);
		this.displayScore();
	}

	changeBet(toValue) {
		this.betSize = toValue;
	}

}


// Array.prototype.shuffle = function() {
// 	for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i)){
// 		x = this[--i];
// 		this[i] = this[j];
// 		this[j] = x;
// 	}
// 	return this;
// };

// Array.prototype.sum = function() {
// 	for(var s = 0, i = this.length; i; s += this[--i]){};
// 	return s;
// };

// Static class hack (auto init)
$(document).ready(function(){ window.App = new App() });

//  Class
// var App = function() { };

class App {
	//  Contants
	ANIM_DELAY  = 300;
    KEY_SPACE   = 32;
    KEY_S       = 83;
    KEY_D       = 68;
    KEY_1       = 49;
    KEY_2       = 50;
    KEY_3       = 51;
    PATTERNS    = [
        [{deg: 0, top: 0}],
        [{deg: 5, top: 0}, {deg: -5, top: 0}],
        [{deg: 5, top: 15}, {deg: -1, top: 0}, {deg: -5, top: 15}],
        [{deg: 9, top: 20}, {deg: 4, top: 0}, {deg: -4, top: 0},
		 {deg: -9, top: 15}],
        [{deg: 12, top: 50}, {deg: 8, top: 10}, {deg: -4, top: 0},
		 {deg: -12, top: 15}, {deg: -16, top: 40}],
        [{deg: 14, top: 40}, {deg: 8, top: 10}, {deg: -2, top: 5},
		 {deg: -5, top: 15}, {deg: -8, top: 40}, {deg: -14, top: 70}],
        [{deg: 14, top: 70}, {deg: 8, top: 30}, {deg: 4, top: 10},
		 {deg: 0, top: 5}, {deg: -4, top: 20}, {deg: -8, top: 40},
		 {deg: -16, top: 70}]
    ];

	//  Variables
	types = ['clubs', 'diamonds', 'hearts', 'spades'];
	// cards           = [];
	deckConstructor = () => { return new RealisticDeck() };
	deck = this.deckConstructor();
	// cardsIndex      = 0;
	isPlaying       = false;
	gameDealed      = false;
	dealNav         = $('#deal');
	actionsNav      = $('#actions');
	doubleBtn       = $('#double');
	// pCardsContainer = $('#player-cards');
	// dCardsContainer = $('#dealer-cards');
	// playerTotal     = $('#player-total');
	// playerCards     = new Hand();
	// playerAces      = 0;
	// dealerTotal     = $('#dealer-total');
	// dealerCards     = new Hand();
	// dealerAces      = 0;
	chips           = $('#chips');
	allChips        = $('.chip');
	// bank            = 100;
	// bankroll        = $('#this.bankroll');
	// doubled         = false;
	currentBet      = this.allChips.first().data('value');
	resizeTimer     = null;
	canDoAction     = true;
	isStanding      = false;
	gameEnded       = false;
	html            = $('html');
	isSafari = this.html.attr('browser') === 'Safari';
	dealer = new Dealer($('#dealer-cards'), $('#dealer-total'), this.isSafari);
	player = new Player($('#player-cards'), $('#player-total'), this.isSafari,
						$('#bankroll'));

	constructor () {
		this.initialize.apply(this, arguments);
	}



	//  public
	// pro.initialize = function(opts) { initialize() };
	// pro.deal       = function() { deal() };
	// pro.hit        = function() { hit() };
	// pro.stand      = function() { stand() };
	// pro.doubledown = function() { doubledown() };

	// ?? not clear why they have opts
	public initialize(opts) {
		$('a[href="#"]').bind('click', function(e){ e.preventDefault(); });
		// this.initBet();
		this.initResize();
		this.initKeyboardKeys();

		setTimeout(function(){
			window.scrollTo(0, 1)
		}, 500);
	}

	//  Resize management
	private initResize() {
		$(window).bind('resize', this.onWindowResize);
		this.onWindowResize(null);
	}

	private onWindowResize(e:any) {
		clearTimeout(this.resizeTimer);
		this.resizeTimer = setTimeout( () => {
			this.centerContainers();
		}, 100);
	}

	//  Keyboard managment
	private initKeyboardKeys() {
		$(document).bind('keydown', this.onKeyDown);
		$(document).bind('keyup', this.onKeyUp);
	}

	private onKeyDown(e:any) {
		switch ( e.keyCode ) {
        case this.KEY_SPACE :
			( this.isPlaying )
				? this.actionsNav.children('li:first-child').children('a').addClass('active')
				: this.dealNav.children('a').addClass('active');
			break;
        case this.KEY_S :
			this.actionsNav.children('li:nth-child(2)').children('a').addClass('active');
			break;
        case this.KEY_D :
			this.actionsNav.children('li:nth-child(3)').children('a').addClass('active');
			break;
        case this.KEY_1 :
			this.selectChip(0);
			break;
        case this.KEY_2 :
			this.selectChip(1);
			break;
        case this.KEY_3 :
			this.selectChip(2);
			break;
		}
	}

	private onKeyUp(e) {
		e.preventDefault();

		switch ( e.keyCode ) {
        case this.KEY_SPACE :
			if ( this.isPlaying ) {
				this.hit();
				this.actionsNav.children('li:first-child').children('a').removeClass('active')
			} else {
				this.deal();
				this.dealNav.children('a').removeClass('active');
			}
        case this.KEY_S :
			this.stand();
			this.actionsNav.children('li:nth-child(2)').children('a').removeClass('active');
			break;
        case this.KEY_D :
			this.doubledown();
			this.actionsNav.children('li:nth-child(3)').children('a').removeClass('active');
			break;
        case this.KEY_1 : this.selectChip(0); break;
        case this.KEY_2 : this.selectChip(1); break;
        case this.KEY_3 : this.selectChip(2); break;
		}
	}

	private selectChip (index){
		if ( this.isPlaying || this.gameEnded ) return;
		this.allChips.eq(index).trigger('click');
	}

	//  Cards management
	// private initDeck(){
	// 	for ( var i = 0; i < this.types.length; i++ ) {
	// 		for ( var j = 1; j <= 13; j++ ) {
	// 			var value = ( j > 10 ) ? 10 : j;
	// 			this.cards.push({ card:j, value: value, type: this.types[i] });
	// 		};
	// 	}

	// 	this.cards.shuffle();
	// }

	private addCard(side, toAdd:AbstractPlayer, callback){
		// var cardData  = this.cards[this.cardsIndex];
		var cardData = this.deck.getCurrent();
		var newCard = new Card(this.deck.currentIndex, cardData.type, cardData.card, side);

		// var toAdd = (player === 'player') ?
		// 	this.player :
		// 	this.dealer;

		toAdd.addCard(newCard, callback);
	}

	private centerContainers(){
		this.dealer.centerContainer();
		this.player.centerContainer();
	}


	//  Game management
	public deal(){
		if ( this.isPlaying || !this.canDoAction || this.gameEnded ) return;

		this.isPlaying = true;

		if ( this.gameDealed ) {
			this.doubleBtn.removeClass('desactivate');
			// this.playerTotal.html('');
			// this.dealerTotal.html('');
			// this.playerAces  = 0;
			// this.dealerAces  = 0;
			// this.playerCards = new Hand();
			// this.dealerCards = new Hand();
			this.player.resetHand();
			this.dealer.resetHand();
			this.deck       = this.deckConstructor();
			// this.cardsIndex  = 0;
			this.player.doubled     = false;
			this.canDoAction = true;
			this.isStanding  = false;
			$('#message').remove();
		}

		// this.pCardsContainer.html('');
		// this.dCardsContainer.html('');
		// this.initDeck();

		this.player.changeBankroll(-1);
		this.disableWhile(() => this.ditributeCards());
		this.gameDealed = true;
	}

	public hit(){
		if ( !this.isPlaying || !this.canDoAction || this.isStanding || this.gameEnded ) return;

		this.doubleBtn.addClass('desactivate');
		this.addCard('front', this.player, () => {
			if (this.player.getScore() > 21) this.lose('lose-busted');
		});
	}

	public stand()
	{
		if ( !this.isPlaying || !this.canDoAction || this.isStanding || this.gameEnded ) return;

		this.isStanding = true;
		this.revealDealerCard();

		setTimeout( () => {
			if ( this.dealer.getScore() < 17 ) this.dealerTurn();
			else this.end();
		}, this.ANIM_DELAY);
	}

	private dealerTurn()
	{
		this.addCard('front', this.dealer, () => {
			// this.dealerTotal.html(String(this.calculateDealerScore()));
			this.dealer.displayScore();

			if (this.dealer.getScore() < 17) this.dealerTurn();
			else this.end();
		});
	}

	public doubledown()
	{
		if ( !this.isPlaying || !this.canDoAction || this.isStanding || this.doubleBtn.hasClass('desactivate') || this.gameEnded ) return;

		this.player.changeBankroll(-1);
		this.player.doubled = true;
		this.addCard('front', this.player, () => {
			if ( this.player.getScore() > 21 ) this.lose('lose-busted');
			else this.stand();
		});
	}

	private push( msg )
	{
		this.showMessage(msg);
		var increment = ( this.player.doubled ) ? 2 : 1;
		this.player.changeBankroll(increment);
		this.stopGame();
	}

	private win( msg )
	{
		this.showMessage(msg);
		var increment = ( this.player.doubled ) ? 4 : 2;
		this.player.changeBankroll(increment);
		this.stopGame();
	}

	private lose( msg )
	{
		this.showMessage(msg);
		this.player.changeBankroll(0);
		this.stopGame();
	}

	private showMessage( status )
	{
		var msg       = document.createElement('div'),
        content   = '',
        message   = $('#message');

		if ( message.length > 0 ) message.remove();

		msg.className = status;
		msg.id        = 'message';

		switch ( status ) {
        case 'win': content = 'You win'; break;
        case 'win-blackjack': content = 'You win<span>Blackjack</span>'; break;
        case 'win-dealer-busted': content = 'You win<span>Dealer busted</span>'; break;
        case 'lose': content = 'You lose'; break;
        case 'lose-blackjack': content = 'You lose<span>Blackjack</span>'; break;
        case 'lose-busted': content = 'You lose<span>Busted</span>'; break;
        case 'push': content = 'Push<span>No winner</span>'; break;
        case 'game-over': content = 'Game over'; break;
        default: content = '<span>Something broke, don’t know what happened...</span>'; break;
		}

		msg.innerHTML = content;
		this.player.cardsContainer.after(msg);
	}

	private end()
	{
		var pScore  = this.player.getScore(),
        dScore  = this.dealer.getScore();

		if ( dScore > 21 ) this.win('win-dealer-busted');
		else if ( dScore > pScore ) this.lose('lose');
		else if ( pScore > dScore ) this.win('win');
		else if ( pScore == dScore ) this.push('push');
	}

	private endGame()
	{
		this.showMessage('game-over');
		this.gameEnded = true;

		var overlay = document.createElement('div');
		overlay.id = 'overlay';

		$('body').append(overlay);
	}

	private stopGame()
	{
		this.isPlaying = false;
		this.dealNav.show();
		this.actionsNav.hide();
		this.chips.removeClass('disabled');

		this.allChips.each((i) => {
			var chip = $(this);
			if ( chip.data('value') > this.player.bankValue ) {
				chip.addClass('desactivate');

				var chipsAvailable =
					this.allChips.removeClass('bet').not('.desactivate');
				if ( chipsAvailable.length == 0 ) this.endGame();
				else {
					var newChip = chipsAvailable.last();
					newChip.addClass('bet');
					this.player.changeBet(newChip.data('value'));
					this.chips.prepend(newChip);
				}

			} else if ( chip.hasClass('desactivate') ) chip.removeClass('desactivate');
		});
	}

	private disableWhile(callback) {
		this.canDoAction = false;
		var ret = callback();
		this.canDoAction = true;

		return ret;
	}

	private ditributeCards()
	{
		this.addCard('front', this.player, () => {
			this.addCard('front', this.dealer, () => {
				this.addCard('front', this.player, () => {
					this.addCard('back', this.dealer, () => {
						this.checkBlackjack();
					});
				});
			});
		});

		this.dealNav.hide();
		this.actionsNav.show();
		this.chips.addClass('disabled');
	}

	private checkBlackjack()
	{
		var pScore  = this.player.getScore(),
        dScore  = this.dealer.getScore();

		if ( pScore == 21 && dScore == 21 ) this.push('Push - No winner');
		else if ( pScore == 21 ) this.win('win-blackjack');
		else if ( dScore == 21 ) {
			this.lose('lose-blackjack');
			this.revealDealerCard();
		}
	}

	//  Player management
	// private addToPlayerTotal( value )
	// {
	// 	// if ( value == 1 ) {
	// 	// 	value = 11;
	// 	// 	this.playerAces++;
	// 	// }

	// 	this.playerCards.push(value);
	// 	this.playerTotal.html(String(this.calculatePlayerScore()));
    // }

	// private calculatePlayerScore()
	// {
	// 	var score = this.playerCards.sum();

	// 	// if ( score > 21 && this.playerAces > 0 ) {
	// 	// 	this.playerCards.splice(this.playerCards.indexOf(11), 1, 1);
	// 	// 	this.playerAces--;
	// 	// 	score = calculatePlayerScore();
	// 	// }

	// 	return score;
	// }

	//  Dealer management
	private revealDealerCard()
	{							// FIXME: use "flipped" here
		var card    = $('.back'),
        id      = card.data('id'),
        data    = this.deck.getCurrent(),
        newCard = new Card(id, data.type, data.value, 'front');

		newCard.setCss({
			'left' : 10 * card.index() + '%',
			'z-index' : 50-card.index()
		});

		card.after(newCard.container).remove();
		this.dealer.displayScore();
		// this.dealerTotal.html(String(this.calculateDealerScore()));
	}

	private addToDealerTotal( value )
	{
		// if ( value == 1 ) {
		// 	value = 11;
		// 	this.dealerAces++;
		// }

		// this.dealerCards.push(value);
	}

	private calculateDealerScore()
	{
		var score = this.dealer.getScore();

		// if ( score > 21 && this.dealerAces > 0 ) {
		// 	this.dealerCards.splice(this.dealerCards.indexOf(11), 1, 1);
		// 	this.dealerAces--;
		// 	score = this.calculateDealerScore();
		// }

		return score;
	}

	//  Bet management
	// private initBet()
	// {
	// 	this.allChips.bind('click', (e) => {
	// 		var chip = $(this);
	// 		if ( this.isPlaying || chip.hasClass('desactivate') ) return;

	// 		this.allChips.removeClass('bet');
	// 		chip.addClass('bet');
	// 		this.changeBet(chip.data('value'));

	// 		this.chips.prepend(chip);
	// 	});
	// }

	// private changeBet( newValue ) {
	// 	if ( this.isPlaying ) return;
	// 	this.currentBet = newValue;
	// }

	// private changeBankroll( increment ) {
	// 	this.bank += increment * this.currentBet;
	// 	this.bankroll.html((this.bank / 10) + 'k');
	// }
}

/*
 * Browser Detect <http://teev.io/blog/text/13423292>
*/
var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent)
        || this.searchVersion(navigator.appVersion)
        || "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";

        var b = document.documentElement;
        b.setAttribute('browser',  this.browser);
        b.setAttribute('version', this.version );
        b.setAttribute('os', this.OS);
    },
    searchString: function (data) {
        for (var i=0;i<data.length;i++)	{
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1)
                return data[i].identity;
            }
            else if (dataProp)
            return data[i].identity;
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },
    dataBrowser: [
    {
        string: navigator.userAgent,
        subString: "Chrome",
        identity: "Chrome"
    },
    { 	string: navigator.userAgent,
        subString: "OmniWeb",
        versionSearch: "OmniWeb/",
        identity: "OmniWeb"
    },
    {
        string: navigator.vendor,
        subString: "Apple",
        identity: "Safari",
        versionSearch: "Version"
    },
    // { //Makes Typescript angry
    //     prop: window.opera,
    //     identity: "Opera",
    //     versionSearch: "Version"
    // },
    {
        string: navigator.vendor,
        subString: "iCab",
        identity: "iCab"
    },
    {
        string: navigator.vendor,
        subString: "KDE",
        identity: "Konqueror"
    },
    {
        string: navigator.userAgent,
        subString: "Firefox",
        identity: "Firefox"
    },
    {
        string: navigator.vendor,
        subString: "Camino",
        identity: "Camino"
    },
    {		// for newer Netscapes (6+)
        string: navigator.userAgent,
        subString: "Netscape",
        identity: "Netscape"
    },
    {
        string: navigator.userAgent,
        subString: "MSIE",
        identity: "Explorer",
        versionSearch: "MSIE"
    },
    {
        string: navigator.userAgent,
        subString: "Gecko",
        identity: "Mozilla",
        versionSearch: "rv"
    },
    { 		// for older Netscapes (4-)
        string: navigator.userAgent,
        subString: "Mozilla",
        identity: "Netscape",
        versionSearch: "Mozilla"
    }
    ],
    dataOS : [
    {
        string: navigator.platform,
        subString: "Win",
        identity: "Windows"
    },
    {
        string: navigator.platform,
        subString: "Mac",
        identity: "Mac"
    },
    {
        string: navigator.userAgent,
        subString: "iPhone",
        identity: "iPhone/iPod"
    },
    {
        string: navigator.platform,
        subString: "Linux",
        identity: "Linux"
    }
    ]
};
BrowserDetect.init();
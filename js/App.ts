/*
 *  BytesJack fork
 */

/// <reference path='../libs/jquery.d.ts'/>
/// <reference path='./players.ts'/>
/// <reference path='./cards.ts'/>
/// <reference path='./globals.ts'/>


interface Window {
	App: App;
}


// Static class hack (auto init)
$(document).ready(function(){ window.App = new App() });

//  Class
// var App = function() { };

class App {
	//  Contants
    KEY_SPACE   = 32;
    KEY_S       = 83;
    KEY_D       = 68;
    KEY_1       = 49;
    KEY_2       = 50;
    KEY_3       = 51;

	//  Variables
	types = ['clubs', 'diamonds', 'hearts', 'spades'];
	deckConstructor = () => { return new Cards.RealisticDeck() };
	deck = this.deckConstructor();
	isPlaying       = false;
	gameDealed      = false;
	dealNav         = $('#deal');
	actionsNav      = $('#actions');
	doubleBtn       = $('#double');
	chips           = $('#chips');
	allChips        = $('.chip');
	currentBet      = this.allChips.first().data('value');
	resizeTimer     = null;
	canDoAction     = true;
	isStanding      = false;
	gameEnded       = false;
	html            = $('html');
	isSafari = this.html.attr('browser') === 'Safari';
	dealer = new Players.Dealer($('#dealer-cards'), $('#dealer-total'), this.isSafari);
	player = new Players.Player($('#player-cards'), $('#player-total'), this.isSafari,
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
		$(window).bind('resize', () => { this.onWindowResize });
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

	private addCard(side, toAdd:Players.AbstractPlayer, callback){
		// var cardData  = this.cards[this.cardsIndex];
		var cardData = this.deck.getCurrent();
		var newCard = new Cards.Card(this.deck.currentIndex, cardData.type, cardData.card, side);

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
			// this.playerCards = new Cards.Hand();
			// this.dealerCards = new Cards.Hand();
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

	private withCheck(callback) {
		if(!this.isPlaying || !this.canDoAction ||
		   this.isStanding || this.gameEnded) {
			return;
		} else {
			callback();
		}
	}

	public hit(){
		this.withCheck(() => { this._hit(); });
	}

	public stand() {
		this.withCheck(() => { this._stand(); });
	}

	public doubledown() {
		this.withCheck(() => { this._doubledown(); });
	}

	private _hit(){
		this.doubleBtn.addClass('desactivate');
		this.addCard('front', this.player, () => {
			if (this.player.getScore() > 21) this.lose('lose-busted');
		});
	}

	private _stand()
	{
		this.isStanding = true;
		this.revealDealerCard();

		setTimeout( () => {
			if ( this.dealer.getScore() < 17 ) this.dealerTurn();
			else this.end();
		}, G.ANIM_DELAY);
	}

	public _doubledown()
	{
		if (this.doubleBtn.hasClass('desactivate')) {
			return;
		}

		this.player.changeBankroll(-1);
		this.player.doubled = true;
		this.addCard('front', this.player, () => {
			if ( this.player.getScore() > 21 ) this.lose('lose-busted');
			else this.stand();
		});
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

		this.player.cardsContainer.after(msg);
	}

	private end()
	{
		console.log("Trying to end....");
		var pScore  = this.player.getScore(),
        dScore  = this.dealer.getScore();

		if ( dScore > 21 ) {
			this.win('win-dealer-busted');
		} else if ( dScore > pScore ) {
			this.lose('lose');
		} else if ( pScore > dScore ) {
			this.win('win');
		} else {
			this.push('push');
		}
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

			} else if ( chip.hasClass('desactivate') ) {
				chip.removeClass('desactivate');
			}
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
        newCard = new Cards.Card(id, data.type, data.value, 'front');

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